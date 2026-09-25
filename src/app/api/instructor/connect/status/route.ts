import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStripeClient, isPaymentsConfigured } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }

  if (!isPaymentsConfigured()) {
    return NextResponse.json({ configured: false, connected: false, payoutsEnabled: false });
  }

  const profile = await prisma.instructorProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  if (!profile.stripeAccountId) {
    return NextResponse.json({ configured: true, connected: false, payoutsEnabled: false });
  }

  const stripe = getStripeClient();
  const account = await stripe.accounts.retrieve(profile.stripeAccountId);
  const payoutsEnabled = Boolean(account.payouts_enabled && account.charges_enabled);

  if (payoutsEnabled !== profile.payoutsEnabled) {
    await prisma.instructorProfile.update({ where: { userId: session.user.id }, data: { payoutsEnabled } });
  }

  return NextResponse.json({ configured: true, connected: true, payoutsEnabled });
}
