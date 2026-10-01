"use client";

import { useI18n } from "@/i18n/client";

/** Formats a date in the viewer's own time zone (server-rendered pages would otherwise show server time). */
export default function LocalTime({ iso }: { iso: string }) {
  const { locale } = useI18n();
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
    </time>
  );
}
