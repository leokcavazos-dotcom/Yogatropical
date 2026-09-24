import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const instructors = await prisma.instructorProfile.findMany({
    where: { offersInPerson: true, isCertified: true },
    include: {
      user: { select: { id: true, name: true } },
      specialties: true,
      languages: true,
    },
  });
  return NextResponse.json(instructors);
}
