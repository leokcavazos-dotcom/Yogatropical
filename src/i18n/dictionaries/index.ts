import type { Locale } from "@/i18n/config";
import { en, type Dictionary } from "@/i18n/dictionaries/en";
import { es } from "@/i18n/dictionaries/es";
import { pt } from "@/i18n/dictionaries/pt";
import { fr } from "@/i18n/dictionaries/fr";
import { ht } from "@/i18n/dictionaries/ht";

export const DICTIONARIES: Record<Locale, Dictionary> = { en, es, pt, fr, ht };
