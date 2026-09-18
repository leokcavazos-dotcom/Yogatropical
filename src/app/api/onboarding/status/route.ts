import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";
import { isPaymentsConfigured } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      instructorProfile: { include: { specialties: true, languages: true } },
      preferredLanguage: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const waiverSigned = await hasSignedCurrentWaiver(user.id);

  return NextResponse.json({
    role: user.role,
    name: user.name,
    phone: user.phone,
    preferredLanguageId: user.preferredLanguageId,
    onboardingCompletedAt: user.onboardingCompletedAt,
    waiverSigned,
    paymentsConfigured: isPaymentsConfigured(),
    instructorProfile: user.instructorProfile,
  });
}
