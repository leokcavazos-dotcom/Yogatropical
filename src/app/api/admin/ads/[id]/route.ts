import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, parseAdUpdate, saveFormImage, firstError } from "@/lib/storeAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form." }, { status: 400 });

  const parsed = parseAdUpdate(formData);
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const image = await saveFormImage(formData, "ads", "banners");
  if (image.error) return NextResponse.json({ error: image.error }, { status: 400 });

  const updated = await prisma.ad
    .update({ where: { id }, data: { ...parsed.data, ...(image.path ? { imagePath: image.path } : {}) } })
    .catch(() => null);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { id } = await params;
  await prisma.ad.deleteMany({ where: { id } });
  return NextResponse.json({ deleted: true });
}
