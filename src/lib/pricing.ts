import { prisma } from "@/lib/prisma";
import { findCountry } from "@/lib/countries";
import { minimumPrice, type MinimumPriceInput } from "@/lib/pricingRules";

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

export function validateMinimumPrice(price: number, input: MinimumPriceInput): string | null {
  if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number.";
  const min = minimumPrice(input);
  if (min === null) return "Pick the country where you teach in person first.";
  if (price < min) {
    const where =
      input.deliveryMethod === "IN_PERSON" ? `In-person classes (${findCountry(input.country)?.name})` : "Virtual classes";
    return `${where} must be at least $${min} per student for ${input.durationMinutes} minutes.`;
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
