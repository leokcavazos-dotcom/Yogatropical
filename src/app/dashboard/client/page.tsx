"use client";

import ClientProfileForm from "@/components/ClientProfileForm";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { fmt, label } from "@/i18n/config";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/legal";

interface Booking {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED";
  priceCharged: number;
  classSession: {
    id: string;
    title: string;
    startTime: string;
    durationMinutes: number;
    mode: "SCHEDULED" | "ON_DEMAND";
    deliveryMethod: "VIRTUAL" | "IN_PERSON";
    locationAddress: string | null;
    instructor: { name: string };
    specialties: { id: string; name: string }[];
    languages: { id: string; name: string }[];
  };
}

const STATUS_STYLES: Record<Booking["status"], string> = {
  PENDING: "bg-sunset/20 text-sunset",
  ACCEPTED: "bg-mint/15 text-mint",
  DECLINED: "bg-red-500/15 text-red-300",
  CANCELLED: "bg-surface-2 text-foreground/60",
  COMPLETED: "bg-surface-2 text-foreground/60",
};

function hoursUntil(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / 3_600_000;
}

export default function ClientDashboard() {
  const { locale, t } = useI18n();
  const cd = t.clientDashboard;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/me/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch triggers a loading flag
    load();
  }, []);

  async function cancelBooking(b: Booking) {
    setMessage(null);
    const hours = CANCELLATION_WINDOW_HOURS;
    const lateCancel = b.status === "ACCEPTED" && hoursUntil(b.classSession.startTime) < hours;
    if (!window.confirm(lateCancel ? fmt(cd.lateCancel, { hours }) : cd.confirmCancel)) return;
    const res = await fetch(`/api/enrollments/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? cd.cancelFailed);
    }
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-mint">{cd.title}</h1>
        <Link href="/browse" className="rounded-full bg-flamingo px-4 py-2 text-sm font-semibold text-ink hover:bg-flamingo-bright">
          {cd.browse}
        </Link>
      </div>

      <p className="mt-2 text-sm text-foreground/60">
        {fmt(cd.freeCancellation, { hours: CANCELLATION_WINDOW_HOURS })}{" "}
        <Link href="/terms#section-7" className="underline hover:text-flamingo">
          {cd.cancellationPolicy}
        </Link>
      </p>
      {message && <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-300">{message}</p>}
      {loading && <p className="mt-6 text-foreground/60">{t.common.loading}</p>}
      {!loading && bookings.length === 0 && (
        <p className="mt-6 text-foreground/60">{cd.empty}</p>
      )}

      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-2xl border border-line p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-foreground">{b.classSession.title}</h3>
                <p className="text-sm text-foreground/60">
                  {t.browse.with} {b.classSession.instructor.name} ·{" "}
                  {new Date(b.classSession.startTime).toLocaleString(locale)} ·{" "}
                  {fmt(t.common.minutes, { n: b.classSession.durationMinutes })}
                </p>
                <p className="text-xs text-foreground/60">
                  {b.classSession.specialties.map((s) => s.name).join(", ")} ·{" "}
                  {b.classSession.languages.map((l) => l.name).join(", ")}
                </p>
                <p className="text-xs text-foreground/60">
                  {b.classSession.deliveryMethod === "IN_PERSON"
                    ? fmt(t.browse.inPersonAt, { address: b.classSession.locationAddress ?? "" })
                    : t.browse.virtualTag}
                </p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                  {label(cd.status, b.status)}
                </span>
                <p className="mt-1 text-sm font-semibold text-flamingo">${b.priceCharged.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              {b.status === "ACCEPTED" && b.classSession.deliveryMethod === "VIRTUAL" && (
                <Link
                  href={`/room/${b.classSession.id}`}
                  className="rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-ink hover:bg-mint-bright"
                >
                  {cd.joinRoom}
                </Link>
              )}
              {b.status === "ACCEPTED" && b.classSession.deliveryMethod === "IN_PERSON" && (
                <p className="text-sm text-foreground/80">
                  <span className="font-medium">{cd.location}</span> {b.classSession.locationAddress}
                </p>
              )}
              {(b.status === "PENDING" || b.status === "ACCEPTED") && (
                <button
                  onClick={() => cancelBooking(b)}
                  className="rounded-full border border-line px-4 py-1.5 text-sm text-foreground/70 hover:bg-surface-2"
                >
                  {cd.cancel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <ClientProfileForm />
      </div>
    </main>
  );
}
