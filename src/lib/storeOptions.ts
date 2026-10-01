// Labels for the store and ad bar. Plain data, so client components can import it.

export const PRODUCT_TIERS = {
  LUXE: "Luxe",
  EVERYDAY: "Everyday",
  BUDGET: "Budget-friendly",
} as const;
export type ProductTierKey = keyof typeof PRODUCT_TIERS;

export const AD_PLACEMENTS = {
  HOME: "Home page",
  BROWSE: "Browse classes",
  STORE: "Store",
} as const;
export type AdPlacementKey = keyof typeof AD_PLACEMENTS;
