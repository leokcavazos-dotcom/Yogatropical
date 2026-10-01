import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readUploadedFile, contentTypeFor } from "@/lib/fileStorage";
import { canViewClientProfile } from "@/lib/profileAccess";

// Instructor photos are public. Client photos follow the client-profile rules.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { photoPath: true, role: true } });
  if (!user?.photoPath) return NextResponse.json({ error: "No photo." }, { status: 404 });

  const isPublic = user.role === "INSTRUCTOR";
  if (!isPublic) {
    const session = await auth();
    if (!(await canViewClientProfile(session?.user, id))) {
      return NextResponse.json({ error: "You don't have access to this photo." }, { status: 403 });
    }
  }

  const bytes = await readUploadedFile(user.photoPath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentTypeFor(user.photoPath),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": isPublic ? "public, max-age=300" : "private, no-store",
    },
  });
}
