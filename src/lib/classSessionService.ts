import { prisma } from "@/lib/prisma";
import { generateVideoRoomSlug } from "@/lib/video";
import { getPriceBand, validatePriceAgainstBand, isAllowedDuration } from "@/lib/pricing";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";

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

  const band = await getPriceBand(input.durationMinutes);
  const priceError = validatePriceAgainstBand(input.pricePerStudent, band);
  if (priceError) throw new ClassSessionError(priceError);

  return prisma.classSession.create({
    data: {
      instructorId: input.instructorId,
      mode: "SCHEDULED",
      title: input.title,
      description: input.description ?? "",
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      capacity: input.capacity,
      pricePerStudent: input.pricePerStudent,
      videoRoomSlug: generateVideoRoomSlug(),
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
  const commissionAmount = Math.round(session.pricePerStudent * (commissionPercent / 100) * 100) / 100;

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

export async function respondToEnrollment(
  enrollmentId: string,
  instructorId: string,
  decision: "ACCEPTED" | "DECLINED",
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { classSession: { include: { _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } } } } },
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

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: decision, respondedAt: new Date() },
  });

  if (decision === "ACCEPTED") {
    const capacity = enrollment.classSession.capacity;
    const newAcceptedCount = enrollment.classSession._count.enrollments + 1;
    if (capacity !== null && newAcceptedCount >= capacity) {
      await prisma.classSession.update({ where: { id: enrollment.classSessionId }, data: { status: "FULL" } });
    }
  }

  return updated;
}
