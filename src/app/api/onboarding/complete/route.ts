import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";

export async function PATCH() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!(await hasSignedCurrentWaiver(session.user.id))) {
    return NextResponse.json({ error: "Please sign the safety waiver first." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompletedAt: new Date() },
  });
  return NextResponse.json({ onboardingCompletedAt: updated.onboardingCompletedAt });
}
