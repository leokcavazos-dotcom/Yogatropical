// Country tiers set the minimum hourly price for in-person classes (see
// pricingRules.ts). Tiers roughly follow the World Bank income groups:
// 1 = high income, 2 = upper-middle, 3 = lower-middle/low. Borderline
// countries sit in the lower tier, since a lower minimum never stops an
// instructor from charging more. Move a country by changing its tier here.
export type CountryTier = 1 | 2 | 3;

export interface Country {
  code: string;
  name: string;
  tier: CountryTier;
}

export const COUNTRIES: Country[] = [
  // Americas
  { code: "AG", name: "Antigua and Barbuda", tier: 1 },
  { code: "AR", name: "Argentina", tier: 2 },
  { code: "BS", name: "Bahamas", tier: 1 },
  { code: "BB", name: "Barbados", tier: 1 },
  { code: "BZ", name: "Belize", tier: 2 },
  { code: "BO", name: "Bolivia", tier: 3 },
  { code: "BR", name: "Brazil", tier: 2 },
  { code: "CA", name: "Canada", tier: 1 },
  { code: "CL", name: "Chile", tier: 1 },
  { code: "CO", name: "Colombia", tier: 2 },
  { code: "CR", name: "Costa Rica", tier: 2 },
  { code: "CU", name: "Cuba", tier: 2 },
  { code: "DM", name: "Dominica", tier: 2 },
  { code: "DO", name: "Dominican Republic", tier: 2 },
  { code: "EC", name: "Ecuador", tier: 2 },
  { code: "SV", name: "El Salvador", tier: 2 },
  { code: "GD", name: "Grenada", tier: 2 },
  { code: "GT", name: "Guatemala", tier: 2 },
  { code: "GY", name: "Guyana", tier: 2 },
  { code: "HT", name: "Haiti", tier: 3 },
  { code: "HN", name: "Honduras", tier: 3 },
  { code: "JM", name: "Jamaica", tier: 2 },
  { code: "MX", name: "Mexico", tier: 2 },
  { code: "NI", name: "Nicaragua", tier: 3 },
  { code: "PA", name: "Panama", tier: 1 },
  { code: "PY", name: "Paraguay", tier: 2 },
  { code: "PE", name: "Peru", tier: 2 },
  { code: "PR", name: "Puerto Rico", tier: 1 },
  { code: "KN", name: "Saint Kitts and Nevis", tier: 1 },
  { code: "LC", name: "Saint Lucia", tier: 2 },
  { code: "VC", name: "Saint Vincent and the Grenadines", tier: 2 },
  { code: "SR", name: "Suriname", tier: 2 },
  { code: "TT", name: "Trinidad and Tobago", tier: 1 },
  { code: "US", name: "United States", tier: 1 },
  { code: "UY", name: "Uruguay", tier: 1 },
  { code: "VE", name: "Venezuela", tier: 3 },
  // Europe
  { code: "AL", name: "Albania", tier: 2 },
  { code: "AT", name: "Austria", tier: 1 },
  { code: "BE", name: "Belgium", tier: 1 },
  { code: "BA", name: "Bosnia and Herzegovina", tier: 2 },
  { code: "BG", name: "Bulgaria", tier: 2 },
  { code: "HR", name: "Croatia", tier: 1 },
  { code: "CY", name: "Cyprus", tier: 1 },
  { code: "CZ", name: "Czechia", tier: 1 },
  { code: "DK", name: "Denmark", tier: 1 },
  { code: "EE", name: "Estonia", tier: 1 },
  { code: "FI", name: "Finland", tier: 1 },
  { code: "FR", name: "France", tier: 1 },
  { code: "GE", name: "Georgia", tier: 2 },
  { code: "DE", name: "Germany", tier: 1 },
  { code: "GR", name: "Greece", tier: 1 },
  { code: "HU", name: "Hungary", tier: 1 },
  { code: "IS", name: "Iceland", tier: 1 },
  { code: "IE", name: "Ireland", tier: 1 },
  { code: "IT", name: "Italy", tier: 1 },
  { code: "LV", name: "Latvia", tier: 1 },
  { code: "LT", name: "Lithuania", tier: 1 },
  { code: "LU", name: "Luxembourg", tier: 1 },
  { code: "MT", name: "Malta", tier: 1 },
  { code: "MD", name: "Moldova", tier: 2 },
  { code: "ME", name: "Montenegro", tier: 2 },
  { code: "NL", name: "Netherlands", tier: 1 },
  { code: "MK", name: "North Macedonia", tier: 2 },
  { code: "NO", name: "Norway", tier: 1 },
  { code: "PL", name: "Poland", tier: 1 },
  { code: "PT", name: "Portugal", tier: 1 },
  { code: "RO", name: "Romania", tier: 1 },
  { code: "RS", name: "Serbia", tier: 2 },
  { code: "SK", name: "Slovakia", tier: 1 },
  { code: "SI", name: "Slovenia", tier: 1 },
  { code: "ES", name: "Spain", tier: 1 },
  { code: "SE", name: "Sweden", tier: 1 },
  { code: "CH", name: "Switzerland", tier: 1 },
  { code: "TR", name: "Türkiye", tier: 2 },
  { code: "UA", name: "Ukraine", tier: 3 },
  { code: "GB", name: "United Kingdom", tier: 1 },
  // Oceania
  { code: "AU", name: "Australia", tier: 1 },
  { code: "FJ", name: "Fiji", tier: 2 },
  { code: "NZ", name: "New Zealand", tier: 1 },
  // Asia and Middle East
  { code: "BD", name: "Bangladesh", tier: 3 },
  { code: "CN", name: "China", tier: 2 },
  { code: "HK", name: "Hong Kong", tier: 1 },
  { code: "IN", name: "India", tier: 3 },
  { code: "ID", name: "Indonesia", tier: 2 },
  { code: "IL", name: "Israel", tier: 1 },
  { code: "JP", name: "Japan", tier: 1 },
  { code: "JO", name: "Jordan", tier: 3 },
  { code: "KR", name: "South Korea", tier: 1 },
  { code: "MY", name: "Malaysia", tier: 2 },
  { code: "NP", name: "Nepal", tier: 3 },
  { code: "PK", name: "Pakistan", tier: 3 },
  { code: "PH", name: "Philippines", tier: 3 },
  { code: "QA", name: "Qatar", tier: 1 },
  { code: "SA", name: "Saudi Arabia", tier: 1 },
  { code: "SG", name: "Singapore", tier: 1 },
  { code: "LK", name: "Sri Lanka", tier: 3 },
  { code: "TW", name: "Taiwan", tier: 1 },
  { code: "TH", name: "Thailand", tier: 2 },
  { code: "AE", name: "United Arab Emirates", tier: 1 },
  { code: "VN", name: "Vietnam", tier: 3 },
  // Africa
  { code: "EG", name: "Egypt", tier: 3 },
  { code: "GH", name: "Ghana", tier: 3 },
  { code: "KE", name: "Kenya", tier: 3 },
  { code: "MU", name: "Mauritius", tier: 2 },
  { code: "MA", name: "Morocco", tier: 3 },
  { code: "NG", name: "Nigeria", tier: 3 },
  { code: "ZA", name: "South Africa", tier: 2 },
].sort((a, b) => a.name.localeCompare(b.name)) as Country[];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(code: string | null | undefined): Country | undefined {
  return code ? BY_CODE.get(code) : undefined;
}
