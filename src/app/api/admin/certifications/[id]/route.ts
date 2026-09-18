import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ReviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().max(2000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review decision." }, { status: 400 });

  const certification = await prisma.certification.findUnique({ where: { id } });
  if (!certification) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updated = await prisma.certification.update({
    where: { id },
    data: {
      status: parsed.data.decision,
      reviewNotes: parsed.data.reviewNotes ?? "",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  if (parsed.data.decision === "APPROVED") {
    await prisma.instructorProfile.update({
      where: { id: certification.instructorProfileId },
      data: { isCertified: true },
    });
  }

  return NextResponse.json(updated);
}
