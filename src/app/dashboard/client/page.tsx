"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    instructor: { name: string };
    specialties: { id: string; name: string }[];
    languages: { id: string; name: string }[];
  };
}

const STATUS_STYLES: Record<Booking["status"], string> = {
  PENDING: "bg-gold/20 text-gold",
  ACCEPTED: "bg-palm/15 text-palm-dark",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-stone-100 text-stone-500",
  COMPLETED: "bg-stone-100 text-stone-500",
};

export default function ClientDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function cancelBooking(id: string) {
    await fetch(`/api/enrollments/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-palm-dark">My bookings</h1>
        <Link href="/browse" className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
          Browse classes
        </Link>
      </div>

      {loading && <p className="mt-6 text-foreground/60">Loading…</p>}
      {!loading && bookings.length === 0 && (
        <p className="mt-6 text-foreground/60">No bookings yet — go find a class that fits your day.</p>
      )}

      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-foreground">{b.classSession.title}</h3>
                <p className="text-sm text-foreground/60">
                  with {b.classSession.instructor.name} · {new Date(b.classSession.startTime).toLocaleString()} ·{" "}
                  {b.classSession.durationMinutes} min
                </p>
                <p className="text-xs text-foreground/60">
                  {b.classSession.specialties.map((s) => s.name).join(", ")} ·{" "}
                  {b.classSession.languages.map((l) => l.name).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
                <p className="mt-1 text-sm font-semibold text-clay-dark">${b.priceCharged.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              {b.status === "ACCEPTED" && (
                <Link
                  href={`/room/${b.classSession.id}`}
                  className="rounded-full bg-palm px-4 py-1.5 text-sm font-semibold text-white hover:bg-palm-dark"
                >
                  Join video room
                </Link>
              )}
              {(b.status === "PENDING" || b.status === "ACCEPTED") && (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-foreground/70 hover:bg-stone-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
