// Business details used across the Terms, Privacy Policy, Instructor
// Agreement, and waiver. Every bracketed value must be filled in before the
// legal pages go live — see isLegalInfoComplete().
export const LEGAL = {
  companyName: "[Company legal name, e.g. Yoga Tropical LLC]",
  stateOfFormation: "[State]",
  mailingAddress: "[Mailing address for legal notices]",
  contactEmail: "[legal@yourdomain.com]",
  effectiveDate: "October 1, 2026",
};

// Bump when the Terms, Privacy Policy, or Instructor Agreement change in a
// meaningful way; each user's accepted version is stored at signup.
export const TERMS_VERSION = "2026-10-v1";

export const CANCELLATION_WINDOW_HOURS = 24;

export function isLegalInfoComplete(): boolean {
  return !Object.values(LEGAL).some((value) => value.includes("["));
}
