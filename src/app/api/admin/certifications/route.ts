import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const certifications = await prisma.certification.findMany({
    orderBy: { submittedAt: "asc" },
    include: { instructorProfile: { include: { user: true } } },
  });
  return NextResponse.json(certifications);
}
