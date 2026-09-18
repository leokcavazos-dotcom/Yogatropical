import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const bookings = await prisma.enrollment.findMany({
    where: { clientId: session.user.id },
    orderBy: { requestedAt: "desc" },
    include: {
      classSession: {
        include: { instructor: { select: { name: true } }, specialties: true, languages: true },
      },
    },
  });
  return NextResponse.json(bookings);
}
