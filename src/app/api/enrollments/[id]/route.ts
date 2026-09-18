import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { respondToEnrollment, ClassSessionError } from "@/lib/classSessionService";

const RespondSchema = z.object({ decision: z.enum(["ACCEPTED", "DECLINED"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Only the instructor can respond to a request." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = RespondSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid decision." }, { status: 400 });

  try {
    const updated = await respondToEnrollment(id, session.user.id, parsed.data.decision);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ClassSessionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const enrollment = await prisma.enrollment.findUnique({ where: { id } });
  if (!enrollment) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (enrollment.clientId !== session.user.id) {
    return NextResponse.json({ error: "You can only cancel your own bookings." }, { status: 403 });
  }

  const updated = await prisma.enrollment.update({
    where: { id },
    data: { status: "CANCELLED", respondedAt: new Date() },
  });
  return NextResponse.json(updated);
}
