import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStripeClient, isPaymentsConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }

  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { error: "Payouts aren't live yet — check back soon." },
      { status: 501 },
    );
  }

  const stripe = getStripeClient();
  const profile = await prisma.instructorProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  let accountId = profile.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
    });
    accountId = account.id;
    await prisma.instructorProfile.update({ where: { userId: user.id }, data: { stripeAccountId: accountId } });
  }

  const origin = new URL(request.url).origin;
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard/instructor?stripe=refresh`,
    return_url: `${origin}/dashboard/instructor?stripe=return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
