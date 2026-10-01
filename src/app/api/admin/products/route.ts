import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, parseProductForm, saveFormImage, firstError } from "@/lib/storeAdmin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: [{ tier: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(products.map(({ imagePath, ...p }) => ({ ...p, hasImage: Boolean(imagePath) })));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form." }, { status: 400 });

  const parsed = parseProductForm(formData);
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const image = await saveFormImage(formData, "store", "products");
  if (image.error) return NextResponse.json({ error: image.error }, { status: 400 });

  const product = await prisma.product.create({ data: { ...parsed.data, imagePath: image.path ?? null } });
  return NextResponse.json({ id: product.id }, { status: 201 });
}
