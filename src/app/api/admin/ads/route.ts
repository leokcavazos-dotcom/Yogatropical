import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, parseAdForm, saveFormImage, firstError } from "@/lib/storeAdmin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const ads = await prisma.ad.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(ads.map(({ imagePath: _imagePath, ...ad }) => ad));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form." }, { status: 400 });

  const parsed = parseAdForm(formData);
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const image = await saveFormImage(formData, "ads", "banners");
  if (image.error) return NextResponse.json({ error: image.error }, { status: 400 });
  if (!image.path) return NextResponse.json({ error: "Attach the ad image." }, { status: 400 });

  const ad = await prisma.ad.create({ data: { ...parsed.data, imagePath: image.path } });
  return NextResponse.json({ id: ad.id }, { status: 201 });
}
