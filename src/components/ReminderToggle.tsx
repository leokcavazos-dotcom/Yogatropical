"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";

/** "Email me class reminders" checkbox for the dashboards, saved as soon as it changes. */
export default function ReminderToggle() {
  const { t } = useI18n();
  const [on, setOn] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/me/reminders")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => setOn(body?.emailReminders ?? null))
      .catch(() => setOn(null));
  }, []);

  async function change(value: boolean) {
    setOn(value);
    setError(false);
    const res = await fetch("/api/me/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailReminders: value, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    }).catch(() => null);
    if (!res?.ok) {
      setOn(!value);
      setError(true);
    }
  }

  if (on === null) return null;
  return (
    <label className="flex items-start gap-2 text-sm text-foreground/80">
      <input type="checkbox" checked={on} onChange={(e) => change(e.target.checked)} className="mt-0.5 accent-flamingo" />
      <span>
        {t.reminders.toggle}
        {error && <span className="ml-2 text-xs text-red-300">{t.reminders.saveFailed}</span>}
      </span>
    </label>
  );
}
