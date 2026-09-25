import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStripeClient, isPaymentsConfigured } from "@/lib/stripe";

const ConfirmSetupSchema = z.object({ paymentMethodId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!isPaymentsConfigured()) {
    return NextResponse.json({ error: "Payment setup isn't live yet — check back soon." }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ConfirmSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing payment method." }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No payment setup in progress for this account." }, { status: 400 });
  }

  const stripe = getStripeClient();
  await stripe.customers.update(user.stripeCustomerId, {
    invoice_settings: { default_payment_method: parsed.data.paymentMethodId },
  });

  return NextResponse.json({ saved: true });
}
