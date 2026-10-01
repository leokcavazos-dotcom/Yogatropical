import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readCertificationFile } from "@/lib/certificationStorage";
import { contentTypeFor } from "@/lib/fileStorage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const certification = await prisma.certification.findUnique({
    where: { id },
    include: { instructorProfile: true },
  });
  if (!certification) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isOwner = certification.instructorProfile.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  // Approved teaching certificates and CPR cards are shown to any signed-in
  // user on the instructor's profile. Insurance documents, and anything
  // pending or rejected, stay between the instructor and admins.
  const isPublicToMembers = certification.status === "APPROVED" && certification.kind !== "INSURANCE";
  if (!isOwner && !isAdmin && !isPublicToMembers) {
    return NextResponse.json({ error: "You don't have access to this file." }, { status: 403 });
  }

  const bytes = await readCertificationFile(certification.storagePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Disposition": `inline; filename="${certification.fileName.replace(/[^\w.\- ]/g, "")}"`,
      "Content-Type": contentTypeFor(certification.fileName),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
