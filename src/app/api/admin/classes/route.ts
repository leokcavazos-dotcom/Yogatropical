import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const classes = await prisma.classSession.findMany({
    orderBy: { startTime: "desc" },
    take: 100,
    include: {
      instructor: { select: { name: true, email: true } },
      specialties: true,
      languages: true,
      audits: { orderBy: { createdAt: "desc" } },
      _count: { select: { enrollments: true } },
    },
  });
  return NextResponse.json(classes);
}
