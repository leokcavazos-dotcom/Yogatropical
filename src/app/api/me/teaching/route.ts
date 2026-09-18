import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }

  const classes = await prisma.classSession.findMany({
    where: { instructorId: session.user.id, status: { not: "CANCELLED" } },
    orderBy: { startTime: "desc" },
    include: {
      specialties: true,
      languages: true,
      enrollments: { include: { client: { select: { name: true, email: true } } } },
    },
  });
  return NextResponse.json(classes);
}
