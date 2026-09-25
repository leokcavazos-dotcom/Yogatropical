import { prisma } from "@/lib/prisma";
import { generateVideoRoomSlug } from "@/lib/video";
import { getPriceBand, validatePriceAgainstBand, isAllowedDuration, calculateCommission } from "@/lib/pricing";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";
import { isPaymentsConfigured, getStripeClient } from "@/lib/stripe";

const WAIVER_REQUIRED_MESSAGE = "Please finish onboarding and sign the safety waiver first.";

export class ClassSessionError extends Error {}

interface CreateScheduledClassInput {
  instructorId: string;
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes: number;
  capacity: number | null;
  pricePerStudent: number;
  specialtyIds: string[];
  languageIds: string[];
  deliveryMethod?: "VIRTUAL" | "IN_PERSON";
  locationAddress?: string;
}

export async function createScheduledClass(input: CreateScheduledClassInput) {
  if (!(await hasSignedCurrentWaiver(input.instructorId))) {
    throw new ClassSessionError(WAIVER_REQUIRED_MESSAGE);
  }
  const profile = await prisma.instructorProfile.findUnique({ where: { userId: input.instructorId } });
  if (!profile) throw new ClassSessionError("Only instructors can publish classes.");
  if (!profile.isCertified) {
    throw new ClassSessionError("Your certification is still pending review, so you can't publish classes yet.");
  }
  if (isPaymentsConfigured() && !profile.payoutsEnabled) {
    throw new ClassSessionError("Connect your Stripe account before publishing classes, so you can get paid.");
  }
  if (!isAllowedDuration(input.durationMinutes)) {
    throw new ClassSessionError("Class length must be one of 20, 40, 60, 80, 100, or 120 minutes.");
  }
  if (input.startTime.getTime() <= Date.now()) {
    throw new ClassSessionError("Scheduled classes must start in the future.");
  }
  if (input.capacity !== null && input.capacity < 1) {
    throw new ClassSessionError("Capacity must be at least 1, or left unset for unlimited.");
  }
  if (input.specialtyIds.length === 0) {
    throw new ClassSessionError("Pick at least one specialty tag for the class.");
  }
  if (input.languageIds.length === 0) {
    throw new ClassSessionError("Pick at least one language the class will be taught in.");
  }

  const deliveryMethod = input.deliveryMethod ?? "VIRTUAL";
  const locationAddress = input.locationAddress?.trim() || null;
  if (deliveryMethod === "IN_PERSON" && !locationAddress) {
    throw new ClassSessionError("Add the address where this in-person class will happen.");
  }

  const band = await getPriceBand(input.durationMinutes);
  const priceError = validatePriceAgainstBand(input.pricePerStudent, band);
  if (priceError) throw new ClassSessionError(priceError);

  return prisma.classSession.create({
    data: {
      instructorId: input.instructorId,
      mode: "SCHEDULED",
      deliveryMethod,
      locationAddress: deliveryMethod === "IN_PERSON" ? locationAddress : null,
      title: input.title,
      description: input.description ?? "",
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      capacity: input.capacity,
      pricePerStudent: input.pricePerStudent,
      videoRoomSlug: deliveryMethod === "VIRTUAL" ? generateVideoRoomSlug() : null,
      specialties: { connect: input.specialtyIds.map((id) => ({ id })) },
      languages: { connect: input.languageIds.map((id) => ({ id })) },
    },
  });
}

export async function requestOnDemandSession(instructorUserId: string, clientId: string) {
  if (!(await hasSignedCurrentWaiver(instructorUserId))) {
    throw new ClassSessionError("This instructor hasn't finished onboarding yet.");
  }
  const profile = await prisma.instructorProfile.findUnique({ where: { userId: instructorUserId } });
  if (!profile) throw new ClassSessionError("Instructor not found.");
  if (!profile.isCertified) throw new ClassSessionError("This instructor isn't approved to teach yet.");
  if (isPaymentsConfigured() && !profile.payoutsEnabled) {
    throw new ClassSessionError("This instructor hasn't finished setting up payouts yet.");
  }
  if (!profile.isAvailableOnDemand) throw new ClassSessionError("This instructor isn't available on demand right now.");
  if (!profile.onDemandDurationMinutes || !profile.onDemandPricePerStudent) {
    throw new ClassSessionError("This instructor hasn't finished setting up on-demand pricing.");
  }

  const session = await prisma.classSession.create({
    data: {
      instructorId: instructorUserId,
      mode: "ON_DEMAND",
      title: "On-demand session",
      startTime: new Date(),
      durationMinutes: profile.onDemandDurationMinutes,
      capacity: profile.onDemandCapacity,
      pricePerStudent: profile.onDemandPricePerStudent,
      videoRoomSlug: generateVideoRoomSlug(),
    },
  });

  const enrollment = await requestEnrollment(session.id, clientId);
  return { session, enrollment };
}

export async function requestInPersonSession(
  instructorUserId: string,
  clientId: string,
  input: { startTime: Date; locationAddress: string },
) {
  if (!(await hasSignedCurrentWaiver(instructorUserId))) {
    throw new ClassSessionError("This instructor hasn't finished onboarding yet.");
  }
  const profile = await prisma.instructorProfile.findUnique({ where: { userId: instructorUserId } });
  if (!profile) throw new ClassSessionError("Instructor not found.");
  if (!profile.isCertified) throw new ClassSessionError("This instructor isn't approved to teach yet.");
  if (isPaymentsConfigured() && !profile.payoutsEnabled) {
    throw new ClassSessionError("This instructor hasn't finished setting up payouts yet.");
  }
  if (!profile.offersInPerson) throw new ClassSessionError("This instructor doesn't offer in-person sessions.");
  if (!profile.inPersonDurationMinutes || !profile.inPersonPricePerStudent) {
    throw new ClassSessionError("This instructor hasn't finished setting up their in-person pricing yet.");
  }
  if (input.startTime.getTime() <= Date.now()) {
    throw new ClassSessionError("In-person sessions must be scheduled for a future date and time.");
  }
  const locationAddress = input.locationAddress.trim();
  if (!locationAddress) {
    throw new ClassSessionError("Add the address where you'd like the instructor to come.");
  }

  const session = await prisma.classSession.create({
    data: {
      instructorId: instructorUserId,
      mode: "SCHEDULED",
      deliveryMethod: "IN_PERSON",
      locationAddress,
      title: "In-person session",
      startTime: input.startTime,
      durationMinutes: profile.inPersonDurationMinutes,
      capacity: profile.inPersonCapacity,
      pricePerStudent: profile.inPersonPricePerStudent,
      videoRoomSlug: null,
    },
  });

  const enrollment = await requestEnrollment(session.id, clientId);
  return { session, enrollment };
}

export async function requestEnrollment(classSessionId: string, clientId: string) {
  if (!(await hasSignedCurrentWaiver(clientId))) {
    throw new ClassSessionError(WAIVER_REQUIRED_MESSAGE);
  }
  const session = await prisma.classSession.findUnique({
    where: { id: classSessionId },
    include: { _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } } },
  });
  if (!session) throw new ClassSessionError("Class not found.");
  if (session.status === "CANCELLED") throw new ClassSessionError("This class was cancelled.");
  if (session.status === "COMPLETED") throw new ClassSessionError("This class has already happened.");
  if (session.status === "FULL") throw new ClassSessionError("This class is full.");
  if (session.instructorId === clientId) throw new ClassSessionError("You can't book your own class.");

  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  const commissionPercent = settings?.commissionPercent ?? 10;
  const { commissionAmount } = calculateCommission(session.pricePerStudent, commissionPercent);

  return prisma.enrollment.upsert({
    where: { classSessionId_clientId: { classSessionId, clientId } },
    update: {},
    create: {
      classSessionId,
      clientId,
      priceCharged: session.pricePerStudent,
      commissionAmount,
    },
  });
}

export async function cancelEnrollment(enrollmentId: string, clientId: string) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new ClassSessionError("Booking not found.");
  if (enrollment.clientId !== clientId) {
    throw new ClassSessionError("You can only cancel your own bookings.");
  }
  if (["DECLINED", "CANCELLED", "COMPLETED", "PAYMENT_FAILED"].includes(enrollment.status)) {
    throw new ClassSessionError("This booking can't be cancelled anymore.");
  }

  if (enrollment.status === "ACCEPTED" && enrollment.paidAt && enrollment.stripePaymentIntentId && isPaymentsConfigured()) {
    const stripe = getStripeClient();
    await stripe.refunds.create({
      payment_intent: enrollment.stripePaymentIntentId,
      reverse_transfer: true,
      refund_application_fee: true,
    });
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "CANCELLED", respondedAt: new Date(), refundedAt: new Date() },
    });
  }

  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "CANCELLED", respondedAt: new Date() },
  });
}

export async function respondToEnrollment(
  enrollmentId: string,
  instructorId: string,
  decision: "ACCEPTED" | "DECLINED",
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      client: true,
      classSession: {
        include: {
          _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } },
          instructor: { include: { instructorProfile: true } },
        },
      },
    },
  });
  if (!enrollment) throw new ClassSessionError("Booking request not found.");
  if (enrollment.classSession.instructorId !== instructorId) {
    throw new ClassSessionError("You can only respond to requests for your own classes.");
  }
  if (enrollment.status !== "PENDING") {
    throw new ClassSessionError("This request has already been responded to.");
  }

  if (decision === "ACCEPTED") {
    const capacity = enrollment.classSession.capacity;
    const acceptedCount = enrollment.classSession._count.enrollments;
    if (capacity !== null && acceptedCount >= capacity) {
      throw new ClassSessionError("This class is already at capacity.");
    }
  }

  let paymentIntentId: string | null = null;
  let finalStatus: "ACCEPTED" | "DECLINED" | "PAYMENT_FAILED" = decision;

  if (decision === "ACCEPTED" && isPaymentsConfigured()) {
    const stripeAccountId = enrollment.classSession.instructor.instructorProfile?.stripeAccountId;
    if (!stripeAccountId) {
      throw new ClassSessionError("You haven't finished connecting your Stripe account yet.");
    }
    if (!enrollment.client.stripeCustomerId) {
      throw new ClassSessionError("This client hasn't added a payment method yet, so this booking can't be charged.");
    }

    const stripe = getStripeClient();
    try {
      const customer = await stripe.customers.retrieve(enrollment.client.stripeCustomerId);
      const defaultPaymentMethod =
        !customer.deleted && typeof customer.invoice_settings?.default_payment_method === "string"
          ? customer.invoice_settings.default_payment_method
          : null;
      if (!defaultPaymentMethod) {
        throw new ClassSessionError("This client hasn't added a payment method yet, so this booking can't be charged.");
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(enrollment.priceCharged * 100),
        currency: "usd",
        customer: enrollment.client.stripeCustomerId,
        payment_method: defaultPaymentMethod,
        off_session: true,
        confirm: true,
        application_fee_amount: Math.round(enrollment.commissionAmount * 100),
        transfer_data: { destination: stripeAccountId },
        metadata: { enrollmentId: enrollment.id },
      });
      paymentIntentId = paymentIntent.id;
    } catch (error) {
      if (error instanceof ClassSessionError) throw error;
      finalStatus = "PAYMENT_FAILED";
    }
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: finalStatus,
      respondedAt: new Date(),
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId, paidAt: new Date() } : {}),
    },
  });

  if (finalStatus === "PAYMENT_FAILED") {
    throw new ClassSessionError("The client's card was declined, so this booking wasn't accepted. Ask them to update their payment method.");
  }

  if (finalStatus === "ACCEPTED") {
    const capacity = enrollment.classSession.capacity;
    const newAcceptedCount = enrollment.classSession._count.enrollments + 1;
    if (capacity !== null && newAcceptedCount >= capacity) {
      await prisma.classSession.update({ where: { id: enrollment.classSessionId }, data: { status: "FULL" } });
    }
  }

  return updated;
}
