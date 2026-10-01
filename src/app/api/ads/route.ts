import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AD_PLACEMENTS, type AdPlacementKey } from "@/lib/storeOptions";

// One random active ad for a placement, or null when there isn't one.
export async function GET(request: Request) {
  const placement = new URL(request.url).searchParams.get("placement") as AdPlacementKey | null;
  if (!placement || !(placement in AD_PLACEMENTS)) {
    return NextResponse.json({ error: "Unknown placement." }, { status: 400 });
  }
  const ads = await prisma.ad.findMany({
    where: { active: true, placements: { has: placement } },
    select: { id: true, altText: true, linkUrl: true, updatedAt: true },
  });
  const ad = ads.length ? ads[Math.floor(Math.random() * ads.length)] : null;
  return NextResponse.json(ad, { headers: { "Cache-Control": "no-store" } });
}
