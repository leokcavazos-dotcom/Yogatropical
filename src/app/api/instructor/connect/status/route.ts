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

  let payoutsEnabled: boolean;
  try {
    const account = await getStripeClient().accounts.retrieve(profile.stripeAccountId);
    payoutsEnabled = Boolean(account.payouts_enabled && account.charges_enabled);
  } catch (error) {
    // Keep the dashboard usable with the last known state if Stripe is unreachable.
    console.error("Stripe Connect status check failed", error);
    return NextResponse.json({ configured: true, connected: true, payoutsEnabled: profile.payoutsEnabled });
  }

  if (payoutsEnabled !== profile.payoutsEnabled) {
    await prisma.instructorProfile.update({ where: { userId: session.user.id }, data: { payoutsEnabled } });
  }

  return NextResponse.json({ configured: true, connected: true, payoutsEnabled });
}
