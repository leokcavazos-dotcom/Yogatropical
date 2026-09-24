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
  deliveryMethod: "VIRTUAL" | "IN_PERSON";
  locationAddress: string | null;
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
interface InPersonInstructor {
  id: string;
  bio: string;
  travelServiceArea: string | null;
  inPersonDurationMinutes: number | null;
  inPersonPricePerStudent: number | null;
  inPersonCapacity: number | null;
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
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [onDemand, setOnDemand] = useState<OnDemandInstructor[]>([]);
  const [inPerson, setInPerson] = useState<InPersonInstructor[]>([]);
  const [inPersonForms, setInPersonForms] = useState<Record<string, { date: string; time: string; address: string }>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/specialties").then((r) => r.json()).then(setSpecialties);
    fetch("/api/languages").then((r) => r.json()).then(setLanguages);
    fetch("/api/classes/on-demand").then((r) => r.json()).then(setOnDemand);
    fetch("/api/classes/in-person").then((r) => r.json()).then(setInPerson);
  }, []);

  const loadClasses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (duration) params.set("duration", String(duration));
    if (specialtyId) params.set("specialtyId", specialtyId);
    if (languageId) params.set("languageId", languageId);
    if (deliveryMethod) params.set("deliveryMethod", deliveryMethod);
    fetch(`/api/classes?${params.toString()}`)
      .then((r) => r.json())
      .then(setClasses)
      .finally(() => setLoading(false));
  }, [date, duration, specialtyId, languageId, deliveryMethod]);

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

  function updateInPersonForm(instructorId: string, field: "date" | "time" | "address", value: string) {
    setInPersonForms((prev) => ({
      ...prev,
      [instructorId]: {
        date: prev[instructorId]?.date ?? "",
        time: prev[instructorId]?.time ?? "",
        address: prev[instructorId]?.address ?? "",
        [field]: value,
      },
    }));
  }

  async function requestInPerson(instructorId: string) {
    setMessage(null);
    const form = inPersonForms[instructorId];
    if (!form?.date || !form?.time || !form?.address) {
      setMessage("Pick a date, time, and address before requesting an in-person session.");
      return;
    }
    const startTime = new Date(`${form.date}T${form.time}:00`).toISOString();
    const res = await fetch("/api/classes/in-person/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId, startTime, locationAddress: form.address }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(body.error ?? "Couldn't send that request.");
      return;
    }
    setMessage("In-person request sent — you'll see it in your dashboard once the instructor responds.");
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

      {inPerson.length > 0 && (
        <section className="mt-8 rounded-2xl border border-palm/30 bg-palm/5 p-5">
          <h2 className="font-serif text-xl text-palm-dark">Book someone to come to you</h2>
          <p className="mt-1 text-sm text-foreground/70">
            At your home, office, or organization — pick a date, time, and address.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {inPerson.map((inst) => {
              const form = inPersonForms[inst.user.id] ?? { date: "", time: "", address: "" };
              return (
                <div key={inst.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-foreground">{inst.user.name}</p>
                  <p className="text-xs text-foreground/60">
                    {inst.specialties.map((s) => s.name).join(", ") || "General practice"} ·{" "}
                    {inst.languages.map((l) => l.name).join(", ") || "Language not set"}
                  </p>
                  {inst.travelServiceArea && (
                    <p className="mt-1 text-xs text-foreground/60">Travels to: {inst.travelServiceArea}</p>
                  )}
                  <p className="mt-1 text-sm text-foreground/80">
                    {inst.inPersonDurationMinutes} min · ${inst.inPersonPricePerStudent?.toFixed(2)}/student
                    {inst.inPersonCapacity ? ` · up to ${inst.inPersonCapacity} students` : " · open capacity"}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => updateInPersonForm(inst.user.id, "date", e.target.value)}
                        className="w-1/2 rounded-lg border border-stone-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => updateInPersonForm(inst.user.id, "time", e.target.value)}
                        className="w-1/2 rounded-lg border border-stone-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <input
                      placeholder="Address (home, office, organization)"
                      value={form.address}
                      onChange={(e) => updateInPersonForm(inst.user.id, "address", e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => requestInPerson(inst.user.id)}
                    className="mt-3 rounded-full bg-palm px-4 py-1.5 text-sm font-semibold text-white hover:bg-palm-dark"
                  >
                    Request in-person session
                  </button>
                </div>
              );
            })}
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
        <div>
          <label className="block text-xs font-medium text-foreground/70">Delivery</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
          >
            <option value="">Any delivery</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="IN_PERSON">In-person</option>
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
                  <p className="mt-1 text-xs text-foreground/60">
                    {c.deliveryMethod === "IN_PERSON" ? `📍 In-person at ${c.locationAddress}` : "💻 Virtual"}
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
