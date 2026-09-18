import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readCertificationFile } from "@/lib/certificationStorage";

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
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "You don't have access to this file." }, { status: 403 });
  }

  const bytes = await readCertificationFile(certification.storagePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Disposition": `inline; filename="${certification.fileName.replace(/"/g, "")}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}
