import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { imageResponse } from "@/lib/fileStorage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await prisma.ad.findUnique({ where: { id }, select: { imagePath: true } });
  if (!ad) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return imageResponse(ad.imagePath, "public, max-age=3600");
}
