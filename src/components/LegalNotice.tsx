import { getI18n } from "@/i18n/server";

/** On English-only legal pages, tells non-English visitors that the English text is the one that applies. */
export default async function LegalNotice() {
  const { locale, t } = await getI18n();
  if (locale === "en") return null;
  return (
    <p lang={locale} className="mb-6 rounded-lg border border-sunset/40 bg-sunset/10 px-4 py-2 text-sm text-sunset">
      {t.legalNotice.englishControls}
    </p>
  );
}
