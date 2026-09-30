"use client";

/** Formats a date in the viewer's own time zone (server-rendered pages would otherwise show server time). */
export default function LocalTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
    </time>
  );
}
