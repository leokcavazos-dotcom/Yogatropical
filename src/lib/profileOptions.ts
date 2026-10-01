// Choices shown on profile forms. Plain data, so client components can import it.

export const AGE_GROUPS = ["Children", "Teens", "Adults", "Seniors"] as const;

export const SPECIAL_POPULATIONS = [
  "People in recovery",
  "Beginners",
  "Pregnancy & postpartum",
  "Veterans",
  "Limited mobility",
  "Chronic pain",
  "Anxiety & stress",
  "Trauma-informed",
  "LGBTQ+",
] as const;

export const CLIENT_AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+"] as const;

export const CERTIFICATION_KINDS = {
  TEACHING: "Teaching certificate",
  CPR: "CPR / First aid card",
  INSURANCE: "Liability insurance",
} as const;

export type CertificationKindKey = keyof typeof CERTIFICATION_KINDS;
