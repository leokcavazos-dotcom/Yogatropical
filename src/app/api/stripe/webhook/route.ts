import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const payoutsEnabled = Boolean(account.payouts_enabled && account.charges_enabled);
      await prisma.instructorProfile.updateMany({
        where: { stripeAccountId: account.id },
        data: { payoutsEnabled },
      });
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const enrollmentId = paymentIntent.metadata?.enrollmentId;
      if (enrollmentId) {
        await prisma.enrollment.updateMany({
          where: { id: enrollmentId, paidAt: null },
          data: { status: "ACCEPTED", stripePaymentIntentId: paymentIntent.id, paidAt: new Date() },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const enrollmentId = paymentIntent.metadata?.enrollmentId;
      if (enrollmentId) {
        await prisma.enrollment.updateMany({
          where: { id: enrollmentId, status: "PENDING" },
          data: { status: "PAYMENT_FAILED", respondedAt: new Date() },
        });
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (paymentIntentId) {
        await prisma.enrollment.updateMany({
          where: { stripePaymentIntentId: paymentIntentId, refundedAt: null },
          data: { refundedAt: new Date() },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
