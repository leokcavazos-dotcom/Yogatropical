import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const AuditSchema = z.object({
  classSessionId: z.string(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
  flagged: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = AuditSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid audit data." }, { status: 400 });

  const audit = await prisma.classAudit.create({
    data: {
      classSessionId: parsed.data.classSessionId,
      adminId: session.user.id,
      rating: parsed.data.rating,
      notes: parsed.data.notes ?? "",
      flagged: parsed.data.flagged ?? false,
    },
  });

  // A flagged class gets its recording held indefinitely (no expiry) until an
  // admin clears the flag, instead of falling under the default retention window.
  if (parsed.data.flagged) {
    await prisma.classSession.update({
      where: { id: parsed.data.classSessionId },
      data: { recordingExpiresAt: null },
    });
  }

  return NextResponse.json(audit, { status: 201 });
}
