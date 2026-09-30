import { findCountry, type CountryTier } from "@/lib/countries";

// Kept free of server imports so client components can show live minimums.
export const VIRTUAL_HOURLY_MIN = 20;
export const IN_PERSON_HOURLY_MIN: Record<CountryTier, number> = { 1: 25, 2: 15, 3: 8 };

export interface MinimumPriceInput {
  deliveryMethod: "VIRTUAL" | "IN_PERSON";
  durationMinutes: number;
  country?: string | null;
}

/** Minimum price per student in whole dollars, or null for in-person without a known country. */
export function minimumPrice({ deliveryMethod, durationMinutes, country }: MinimumPriceInput): number | null {
  let hourly = VIRTUAL_HOURLY_MIN;
  if (deliveryMethod === "IN_PERSON") {
    const found = findCountry(country);
    if (!found) return null;
    hourly = IN_PERSON_HOURLY_MIN[found.tier];
  }
  // Epsilon guards float error (e.g. 20 * 60 / 60) from rounding a whole number up.
  return Math.ceil((hourly * durationMinutes) / 60 - 1e-9);
}
