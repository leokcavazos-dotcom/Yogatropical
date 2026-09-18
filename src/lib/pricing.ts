import { prisma } from "@/lib/prisma";

export const ALLOWED_DURATIONS_MINUTES = [20, 40, 60, 80, 100, 120] as const;
export type AllowedDuration = (typeof ALLOWED_DURATIONS_MINUTES)[number];

export function isAllowedDuration(minutes: number): minutes is AllowedDuration {
  return (ALLOWED_DURATIONS_MINUTES as readonly number[]).includes(minutes);
}

export async function getPlatformSettings() {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
  });
  if (settings) return settings;
  return prisma.platformSettings.create({
    data: { id: "singleton" },
  });
}

export async function getPriceFloor(durationMinutes: number): Promise<number> {
  const floor = await prisma.priceFloor.findUnique({ where: { durationMinutes } });
  if (floor) return floor.minPricePerStudent;
  // Fallback formula if a bracket hasn't been explicitly configured: $8 per 20-minute block.
  return Math.ceil(durationMinutes / 20) * 8;
}

export interface PriceBand {
  min: number;
  max: number;
}

export async function getPriceBand(durationMinutes: number): Promise<PriceBand> {
  const [min, settings] = await Promise.all([
    getPriceFloor(durationMinutes),
    getPlatformSettings(),
  ]);
  const max = Math.round(min * (1 + settings.maxMarkupPercent / 100) * 100) / 100;
  return { min, max };
}

export function validatePriceAgainstBand(price: number, band: PriceBand): string | null {
  if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number.";
  if (price < band.min) {
    return `Price per student must be at least $${band.min.toFixed(2)} for this class length.`;
  }
  if (price > band.max) {
    return `Price per student can't exceed $${band.max.toFixed(2)} for this class length (platform markup cap).`;
  }
  return null;
}

export interface CommissionBreakdown {
  priceCharged: number;
  commissionAmount: number;
  instructorPayout: number;
}

export function calculateCommission(priceCharged: number, commissionPercent: number): CommissionBreakdown {
  const commissionAmount = Math.round(priceCharged * (commissionPercent / 100) * 100) / 100;
  const instructorPayout = Math.round((priceCharged - commissionAmount) * 100) / 100;
  return { priceCharged, commissionAmount, instructorPayout };
}
