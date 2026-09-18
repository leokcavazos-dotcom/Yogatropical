"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

interface Specialty {
  id: string;
  name: string;
}
interface Language {
  id: string;
  name: string;
}
interface ClassListItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  capacity: number | null;
  pricePerStudent: number;
  instructor: { id: string; name: string; instructorProfile: { bio: string } | null };
  specialties: Specialty[];
  languages: Language[];
  _count: { enrollments: number };
}
interface OnDemandInstructor {
  id: string;
  bio: string;
  onDemandDurationMinutes: number | null;
  onDemandPricePerStudent: number | null;
  onDemandCapacity: number | null;
  user: { id: string; name: string };
  specialties: Specialty[];
  languages: Language[];
}

const DURATIONS = [20, 40, 60, 80, 100, 120];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BrowsePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState<number | "">("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [languageId, setLanguageId] = useState("");
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [onDemand, setOnDemand] = useState<OnDemandInstructor[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/specialties").then((r) => r.json()).then(setSpecialties);
    fetch("/api/languages").then((r) => r.json()).then(setLanguages);
    fetch("/api/classes/on-demand").then((r) => r.json()).then(setOnDemand);
  }, []);

  const loadClasses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (duration) params.set("duration", String(duration));
    if (specialtyId) params.set("specialtyId", specialtyId);
    if (languageId) params.set("languageId", languageId);
    fetch(`/api/classes?${params.toString()}`)
      .then((r) => r.json())
      .then(setClasses)
      .finally(() => setLoading(false));
  }, [date, duration, specialtyId, languageId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch triggers a loading flag
    loadClasses();
  }, [loadClasses]);

  async function requestToJoin(classSessionId: string) {
    setMessage(null);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classSessionId }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(body.error ?? "Couldn't send that request.");
      return;
    }
    setMessage("Request sent — you'll see it in your dashboard once the instructor responds.");
    loadClasses();
  }

  async function requestOnDemand(instructorId: string) {
    setMessage(null);
    const res = await fetch("/api/classes/on-demand/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(body.error ?? "Couldn't send that request.");
      return;
    }
    setMessage("Instant request sent — check your dashboard for the video link once accepted.");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl text-palm-dark">Browse classes</h1>

      {onDemand.length > 0 && (
        <section className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <h2 className="font-serif text-xl text-clay-dark">Available now</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {onDemand.map((inst) => (
              <div key={inst.id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold text-foreground">{inst.user.name}</p>
                <p className="text-xs text-foreground/60">
                  {inst.specialties.map((s) => s.name).join(", ") || "General practice"} ·{" "}
                  {inst.languages.map((l) => l.name).join(", ") || "Language not set"}
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  {inst.onDemandDurationMinutes} min · ${inst.onDemandPricePerStudent?.toFixed(2)}/student
                  {inst.onDemandCapacity ? ` · up to ${inst.onDemandCapacity} students` : " · open capacity"}
                </p>
                <button
                  onClick={() => requestOnDemand(inst.user.id)}
                  className="mt-3 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Request now
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-sand/60 p-4">
        <div>
          <label className="block text-xs font-medium text-foreground/70">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">Length</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
          >
            <option value="">Any length</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">Specialty</label>
          <select
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
          >
            <option value="">Any specialty</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">Language</label>
          <select
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
          >
            <option value="">Any language</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message && <p className="mt-4 rounded-lg bg-palm/10 px-4 py-2 text-sm text-palm-dark">{message}</p>}

      <AdSlot
        imageUrl={process.env.NEXT_PUBLIC_AD_SLOT_BROWSE_IMAGE_URL}
        linkUrl={process.env.NEXT_PUBLIC_AD_SLOT_BROWSE_LINK_URL}
      />

      <section className="mt-6 space-y-4">
        {loading && <p className="text-foreground/60">Loading…</p>}
        {!loading && classes.length === 0 && (
          <p className="text-foreground/60">No open classes match those filters yet — try widening your search.</p>
        )}
        {classes.map((c) => {
          const seatsLeft = c.capacity != null ? c.capacity - c._count.enrollments : null;
          return (
            <div key={c.id} className="rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-foreground">{c.title}</h3>
                  <p className="text-sm text-foreground/60">
                    with {c.instructor.name} · {new Date(c.startTime).toLocaleString()} · {c.durationMinutes} min
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {c.specialties.map((s) => s.name).join(", ")} ·{" "}
                    {c.languages.map((l) => l.name).join(", ")}
                  </p>
                  {c.description && <p className="mt-2 text-sm text-foreground/80">{c.description}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-clay-dark">${c.pricePerStudent.toFixed(2)}/student</p>
                  <p className="text-xs text-foreground/60">
                    {seatsLeft != null ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left` : "Open capacity"}
                  </p>
                  <button
                    onClick={() => requestToJoin(c.id)}
                    className="mt-2 rounded-full bg-clay px-4 py-1.5 text-sm font-semibold text-white hover:bg-clay-dark"
                  >
                    Request to join
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <p className="mt-10 text-center text-sm text-foreground/60">
        Not seeing a login prompt for booking?{" "}
        <Link href="/login" className="underline hover:text-clay">
          Sign in
        </Link>{" "}
        first as a client.
      </p>
    </main>
  );
}
