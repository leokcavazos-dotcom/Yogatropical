import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveUploadedFile, readImageUpload } from "@/lib/fileStorage";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const PHOTOS_SUBDIR = "photos";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const image = await readImageUpload(formData?.get("file"), MAX_PHOTO_BYTES);
  if ("error" in image) return NextResponse.json({ error: image.error }, { status: 400 });

  // Name the stored file by its real type, not the uploaded name, so it's always served as that image type.
  const photoPath = await saveUploadedFile(PHOTOS_SUBDIR, session.user.id, `photo.${image.ext}`, image.buffer);
  await prisma.user.update({ where: { id: session.user.id }, data: { photoPath } });
  return NextResponse.json({ hasPhoto: true }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await prisma.user.update({ where: { id: session.user.id }, data: { photoPath: null } });
  return NextResponse.json({ hasPhoto: false });
}
