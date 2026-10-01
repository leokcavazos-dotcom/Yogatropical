// Supported languages. Plain data, so both server and client code can import it.

export const LOCALES = ["en", "es", "pt", "fr", "ht"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "yt_lang";

// Each language's name in that language, for the switcher.
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  ht: "Kreyòl ayisyen",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && (LOCALES as readonly string[]).includes(value as string);
}

/** Fills {placeholders}: fmt("Hi {name}", { name: "Ana" }) → "Hi Ana". */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** Looks up a display label for a stored English value, falling back to the value itself. */
export function label(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}
