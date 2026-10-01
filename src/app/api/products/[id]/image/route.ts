import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { imageResponse } from "@/lib/fileStorage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { imagePath: true } });
  if (!product?.imagePath) return NextResponse.json({ error: "No image." }, { status: 404 });
  return imageResponse(product.imagePath, "public, max-age=3600");
}
