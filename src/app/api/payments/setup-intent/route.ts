import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStripeClient, isPaymentsConfigured } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { configured: false, error: "Payment setup isn't live yet — check back soon." },
      { status: 501 },
    );
  }

  const stripe = getStripeClient();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const setupIntent = await stripe.setupIntents.create({ customer: customerId });

  return NextResponse.json({ configured: true, clientSecret: setupIntent.client_secret });
}
