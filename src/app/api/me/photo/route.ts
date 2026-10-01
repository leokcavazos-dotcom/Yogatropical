import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveUploadedFile, detectFileType } from "@/lib/fileStorage";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const PHOTOS_SUBDIR = "photos";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a photo (JPG, PNG, or WebP)." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photo is too large (5MB max)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(buffer);
  if (type !== "jpg" && type !== "png" && type !== "webp") {
    return NextResponse.json({ error: "Photos must be a JPG, PNG, or WebP image." }, { status: 400 });
  }

  // Name the stored file by its real type, not the uploaded name, so it's always served as that image type.
  const photoPath = await saveUploadedFile(PHOTOS_SUBDIR, session.user.id, `photo.${type}`, buffer);
  await prisma.user.update({ where: { id: session.user.id }, data: { photoPath } });
  return NextResponse.json({ hasPhoto: true }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await prisma.user.update({ where: { id: session.user.id }, data: { photoPath: null } });
  return NextResponse.json({ hasPhoto: false });
}
