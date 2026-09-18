import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveCertificationFile } from "@/lib/certificationStorage";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }
  const profile = await prisma.instructorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json([], { status: 200 });
  const certifications = await prisma.certification.findMany({
    where: { instructorProfileId: profile.id },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(certifications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }
  const profile = await prisma.instructorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Complete your instructor profile first." }, { status: 400 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a certificate file (PDF, PNG, or JPG)." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Certificates must be a PDF, PNG, or JPG." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (10MB max)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await saveCertificationFile(profile.id, file.name, buffer);

  const certification = await prisma.certification.create({
    data: {
      instructorProfileId: profile.id,
      fileName: file.name,
      storagePath,
    },
  });

  return NextResponse.json(certification, { status: 201 });
}
