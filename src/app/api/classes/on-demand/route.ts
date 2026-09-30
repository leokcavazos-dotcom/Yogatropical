import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const instructors = await prisma.instructorProfile.findMany({
    where: { isAvailableOnDemand: true, isCertified: true },
    select: {
      id: true,
      bio: true,
      onDemandDurationMinutes: true,
      onDemandPricePerStudent: true,
      onDemandCapacity: true,
      user: { select: { id: true, name: true } },
      specialties: true,
      languages: true,
    },
  });
  return NextResponse.json(instructors);
}
