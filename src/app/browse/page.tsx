"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdBar from "@/components/AdBar";
import Avatar from "@/components/Avatar";
import { countryName } from "@/lib/countries";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

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
  country: string | null;
  inPersonDurationMinutes: number | null;
  inPersonPricePerStudent: number | null;
  inPersonCapacity: number | null;
  user: { id: string; name: string };
  specialties: Specialty[];
  languages: Language[];
}

const DURATIONS = [20, 40, 60, 80, 100, 120];

function InstructorHeading({ id, name }: { id: string; name: string }) {
  return (
    <Link href={`/instructors/${id}`} className="mb-2 flex items-center gap-3 hover:text-flamingo">
      <Avatar userId={id} name={name} />
      <span className="font-semibold text-foreground underline-offset-2 hover:underline">{name}</span>
    </Link>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BrowsePage() {
  const { locale, t } = useI18n();
  const b = t.browse;
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
      setMessage(body.error ?? b.requestFailed);
      return;
    }
    setMessage(b.requestSent);
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
      setMessage(body.error ?? b.requestFailed);
      return;
    }
    setMessage(b.instantSent);
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
      setMessage(b.inPersonMissing);
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
      setMessage(body.error ?? b.requestFailed);
      return;
    }
    setMessage(b.inPersonSent);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl text-mint">{b.title}</h1>

      {onDemand.length > 0 && (
        <section className="mt-8 rounded-2xl border border-sunset/40 bg-sunset/10 p-5">
          <h2 className="font-display text-xl text-flamingo">{b.availableNow}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {onDemand.map((inst) => (
              <div key={inst.id} className="rounded-xl bg-surface p-4 shadow-sm">
                <InstructorHeading id={inst.user.id} name={inst.user.name} />
                <p className="text-xs text-foreground/60">
                  {inst.specialties.map((s) => s.name).join(", ") || b.general} ·{" "}
                  {inst.languages.map((l) => l.name).join(", ") || b.noLanguage}
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  {fmt(t.common.minutes, { n: inst.onDemandDurationMinutes ?? 0 })} · ${inst.onDemandPricePerStudent?.toFixed(2)}
                  {t.common.perStudent}
                  {" · "}
                  {inst.onDemandCapacity ? fmt(b.upTo, { n: inst.onDemandCapacity }) : b.openCapacity}
                </p>
                <button
                  onClick={() => requestOnDemand(inst.user.id)}
                  className="mt-3 rounded-full bg-sunset px-4 py-1.5 text-sm font-semibold text-ink hover:opacity-90"
                >
                  {b.requestNow}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {inPerson.length > 0 && (
        <section className="mt-8 rounded-2xl border border-mint/30 bg-mint/5 p-5">
          <h2 className="font-display text-xl text-mint">{b.comeToYou}</h2>
          <p className="mt-1 text-sm text-foreground/70">{b.comeToYouBody}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {inPerson.map((inst) => {
              const form = inPersonForms[inst.user.id] ?? { date: "", time: "", address: "" };
              return (
                <div key={inst.id} className="rounded-xl bg-surface p-4 shadow-sm">
                  <InstructorHeading id={inst.user.id} name={inst.user.name} />
                  <p className="text-xs text-foreground/60">
                    {inst.specialties.map((s) => s.name).join(", ") || b.general} ·{" "}
                    {inst.languages.map((l) => l.name).join(", ") || b.noLanguage}
                  </p>
                  {(inst.travelServiceArea || inst.country) && (
                    <p className="mt-1 text-xs text-foreground/60">
                      {fmt(b.travelsTo, {
                        where: [inst.travelServiceArea, countryName(inst.country, locale)].filter(Boolean).join(", "),
                      })}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-foreground/80">
                    {fmt(t.common.minutes, { n: inst.inPersonDurationMinutes ?? 0 })} · ${inst.inPersonPricePerStudent?.toFixed(2)}
                  {t.common.perStudent}
                    {" · "}
                  {inst.inPersonCapacity ? fmt(b.upTo, { n: inst.inPersonCapacity }) : b.openCapacity}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => updateInPersonForm(inst.user.id, "date", e.target.value)}
                        className="w-1/2 rounded-lg border border-line px-2 py-1 text-sm"
                      />
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => updateInPersonForm(inst.user.id, "time", e.target.value)}
                        className="w-1/2 rounded-lg border border-line px-2 py-1 text-sm"
                      />
                    </div>
                    <input
                      placeholder={b.addressPlaceholder}
                      value={form.address}
                      onChange={(e) => updateInPersonForm(inst.user.id, "address", e.target.value)}
                      className="w-full rounded-lg border border-line px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => requestInPerson(inst.user.id)}
                    className="mt-3 rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-ink hover:bg-mint-bright"
                  >
                    {b.requestInPerson}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-surface p-4">
        <div>
          <label className="block text-xs font-medium text-foreground/70">{b.date}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-lg border border-line px-3 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">{b.length}</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 rounded-lg border border-line px-3 py-1.5"
          >
            <option value="">{b.anyLength}</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">{b.specialty}</label>
          <select
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            className="mt-1 rounded-lg border border-line px-3 py-1.5"
          >
            <option value="">{b.anySpecialty}</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">{b.language}</label>
          <select
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className="mt-1 rounded-lg border border-line px-3 py-1.5"
          >
            <option value="">{b.anyLanguage}</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70">{b.delivery}</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="mt-1 rounded-lg border border-line px-3 py-1.5"
          >
            <option value="">{b.anyDelivery}</option>
            <option value="VIRTUAL">{t.common.virtual}</option>
            <option value="IN_PERSON">{t.common.inPerson}</option>
          </select>
        </div>
      </section>

      {message && <p className="mt-4 rounded-lg bg-mint/10 px-4 py-2 text-sm text-mint">{message}</p>}

      <AdBar placement="BROWSE" className="my-6" />

      <section className="mt-6 space-y-4">
        {loading && <p className="text-foreground/60">{t.common.loading}</p>}
        {!loading && classes.length === 0 && (
          <p className="text-foreground/60">{b.noMatches}</p>
        )}
        {classes.map((c) => {
          const seatsLeft = c.capacity != null ? c.capacity - c._count.enrollments : null;
          return (
            <div key={c.id} className="rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg text-foreground">{c.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {b.with}{" "}
                    <Link href={`/instructors/${c.instructor.id}`} className="underline hover:text-flamingo">
                      {c.instructor.name}
                    </Link>{" "}
                    · {new Date(c.startTime).toLocaleString(locale)} · {fmt(t.common.minutes, { n: c.durationMinutes })}
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {c.specialties.map((s) => s.name).join(", ")} ·{" "}
                    {c.languages.map((l) => l.name).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {c.deliveryMethod === "IN_PERSON"
                      ? fmt(b.inPersonAt, { address: c.locationAddress ?? "" })
                      : b.virtualTag}
                  </p>
                  {c.description && <p className="mt-2 text-sm text-foreground/80">{c.description}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-flamingo">
                    ${c.pricePerStudent.toFixed(2)}
                    {t.common.perStudent}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {seatsLeft == null ? b.openCapacity : seatsLeft === 1 ? b.oneSeatLeft : fmt(b.seatsLeft, { n: seatsLeft })}
                  </p>
                  <button
                    onClick={() => requestToJoin(c.id)}
                    className="mt-2 rounded-full bg-flamingo px-4 py-1.5 text-sm font-semibold text-ink hover:bg-flamingo-bright"
                  >
                    {b.requestToJoin}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <p className="mt-10 text-center text-sm text-foreground/60">
        {b.signInHint}{" "}
        <Link href="/login" className="underline hover:text-flamingo">
          {t.nav.signIn}
        </Link>{" "}
        {b.signInHintAfter}
      </p>
    </main>
  );
}
