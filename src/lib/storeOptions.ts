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

export const AFFILIATE_DISCLOSURE =
  "We may earn a small commission when you buy through these links, at no extra cost to you. It helps keep classes affordable. Products are sold and shipped by the retailer.";
