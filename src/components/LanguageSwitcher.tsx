"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

export default function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <label className="flex items-center gap-1">
      <span aria-hidden>🌐</span>
      <span className="sr-only">{t.nav.language}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => choose(e.target.value as Locale)}
        className="rounded-full border border-line bg-surface px-2 py-1 text-xs text-foreground/90 disabled:opacity-60"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
