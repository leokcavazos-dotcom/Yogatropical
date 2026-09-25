"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
}
interface Certification {
  id: string;
  fileName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes: string;
  submittedAt: string;
}
interface Profile {
  id: string;
  bio: string;
  isCertified: boolean;
  isAvailableOnDemand: boolean;
  onDemandDurationMinutes: number | null;
  onDemandCapacity: number | null;
  onDemandPricePerStudent: number | null;
  offersInPerson: boolean;
  travelServiceArea: string | null;
  inPersonDurationMinutes: number | null;
  inPersonCapacity: number | null;
  inPersonPricePerStudent: number | null;
  specialties: Tag[];
  languages: Tag[];
  certifications: Certification[];
}
interface Enrollment {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED" | "PAYMENT_FAILED";
  priceCharged: number;
  commissionAmount: number;
  client: { name: string; email: string };
}
interface ConnectStatus {
  configured: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
}
interface TeachingClass {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  capacity: number | null;
  status: string;
  mode: "SCHEDULED" | "ON_DEMAND";
  deliveryMethod: "VIRTUAL" | "IN_PERSON";
  locationAddress: string | null;
  specialties: Tag[];
  languages: Tag[];
  enrollments: Enrollment[];
}

const DURATIONS = [20, 40, 60, 80, 100, 120];

export default function InstructorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allSpecialties, setAllSpecialties] = useState<Tag[]>([]);
  const [allLanguages, setAllLanguages] = useState<Tag[]>([]);
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  const [bio, setBio] = useState("");
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);
  const [languageIds, setLanguageIds] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");

  const [onDemandOn, setOnDemandOn] = useState(false);
  const [onDemandDuration, setOnDemandDuration] = useState(20);
  const [onDemandPrice, setOnDemandPrice] = useState(8);
  const [onDemandCapacity, setOnDemandCapacity] = useState<string>("");

  const [offersInPersonOn, setOffersInPersonOn] = useState(false);
  const [inPersonServiceArea, setInPersonServiceArea] = useState("");
  const [inPersonDuration, setInPersonDuration] = useState(60);
  const [inPersonPrice, setInPersonPrice] = useState(30);
  const [inPersonCapacity, setInPersonCapacity] = useState<string>("");

  const [classTitle, setClassTitle] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [classDate, setClassDate] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classDuration, setClassDuration] = useState(60);
  const [classCapacity, setClassCapacity] = useState<string>("");
  const [classPrice, setClassPrice] = useState(24);
  const [classSpecialtyIds, setClassSpecialtyIds] = useState<string[]>([]);
  const [classLanguageIds, setClassLanguageIds] = useState<string[]>([]);
  const [classDeliveryMethod, setClassDeliveryMethod] = useState<"VIRTUAL" | "IN_PERSON">("VIRTUAL");
  const [classLocationAddress, setClassLocationAddress] = useState("");

  const loadProfile = useCallback(() => {
    fetch("/api/instructor/profile")
      .then((r) => r.json())
      .then((p: Profile) => {
        setProfile(p);
        setBio(p.bio);
        setSpecialtyIds(p.specialties.map((s) => s.id));
        setLanguageIds(p.languages.map((l) => l.id));
        setOnDemandOn(p.isAvailableOnDemand);
        if (p.onDemandDurationMinutes) setOnDemandDuration(p.onDemandDurationMinutes);
        if (p.onDemandPricePerStudent) setOnDemandPrice(p.onDemandPricePerStudent);
        setOnDemandCapacity(p.onDemandCapacity ? String(p.onDemandCapacity) : "");
        setOffersInPersonOn(p.offersInPerson);
        setInPersonServiceArea(p.travelServiceArea ?? "");
        if (p.inPersonDurationMinutes) setInPersonDuration(p.inPersonDurationMinutes);
        if (p.inPersonPricePerStudent) setInPersonPrice(p.inPersonPricePerStudent);
        setInPersonCapacity(p.inPersonCapacity ? String(p.inPersonCapacity) : "");
      });
  }, []);

  const loadClasses = useCallback(() => {
    fetch("/api/me/teaching").then((r) => r.json()).then(setClasses);
  }, []);

  const loadConnectStatus = useCallback(() => {
    fetch("/api/instructor/connect/status").then((r) => r.json()).then(setConnectStatus);
  }, []);

  useEffect(() => {
    fetch("/api/specialties").then((r) => r.json()).then(setAllSpecialties);
    fetch("/api/languages").then((r) => r.json()).then(setAllLanguages);
    loadProfile();
    loadClasses();
    loadConnectStatus();
  }, [loadProfile, loadClasses, loadConnectStatus]);

  async function connectStripe() {
    setMessage(null);
    setConnectLoading(true);
    const res = await fetch("/api/instructor/connect/onboard", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setConnectLoading(false);
    if (!res.ok || !body.url) {
      setMessage(body.error ?? "Couldn't start Stripe setup.");
      return;
    }
    window.location.href = body.url;
  }

  function toggleFrom(list: string[], id: string, setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function saveProfile() {
    setMessage(null);
    const res = await fetch("/api/instructor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, specialtyIds, languageIds }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Profile saved." : body.error ?? "Couldn't save profile.");
    if (res.ok) loadProfile();
  }

  async function addLanguage() {
    if (!newLanguage.trim()) return;
    const res = await fetch("/api/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLanguage.trim() }),
    });
    const lang = await res.json();
    if (res.ok) {
      setAllLanguages((prev) => (prev.some((l) => l.id === lang.id) ? prev : [...prev, lang]));
      setLanguageIds((prev) => [...prev, lang.id]);
      setNewLanguage("");
    }
  }

  async function uploadCertification(file: File) {
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/instructor/certifications", { method: "POST", body: formData });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Certificate submitted for review." : body.error ?? "Upload failed.");
    if (res.ok) loadProfile();
  }

  async function saveOnDemand() {
    setMessage(null);
    const res = await fetch("/api/instructor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isAvailableOnDemand: onDemandOn,
        onDemandDurationMinutes: onDemandDuration,
        onDemandPricePerStudent: onDemandPrice,
        onDemandCapacity: onDemandCapacity ? Number(onDemandCapacity) : null,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "On-demand settings saved." : body.error ?? "Couldn't save on-demand settings.");
    if (res.ok) loadProfile();
  }

  async function saveInPerson() {
    setMessage(null);
    const res = await fetch("/api/instructor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offersInPerson: offersInPersonOn,
        travelServiceArea: inPersonServiceArea,
        inPersonDurationMinutes: inPersonDuration,
        inPersonPricePerStudent: inPersonPrice,
        inPersonCapacity: inPersonCapacity ? Number(inPersonCapacity) : null,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "In-person settings saved." : body.error ?? "Couldn't save in-person settings.");
    if (res.ok) loadProfile();
  }

  async function createClass() {
    setMessage(null);
    if (!classDate || !classTime) {
      setMessage("Pick a date and time for the class.");
      return;
    }
    if (classDeliveryMethod === "IN_PERSON" && !classLocationAddress.trim()) {
      setMessage("Add an address for this in-person class.");
      return;
    }
    const startTime = new Date(`${classDate}T${classTime}:00`).toISOString();
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: classTitle,
        description: classDescription,
        startTime,
        durationMinutes: classDuration,
        capacity: classCapacity ? Number(classCapacity) : null,
        pricePerStudent: classPrice,
        specialtyIds: classSpecialtyIds,
        languageIds: classLanguageIds,
        deliveryMethod: classDeliveryMethod,
        locationAddress: classDeliveryMethod === "IN_PERSON" ? classLocationAddress : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(body.error ?? "Couldn't publish that class.");
      return;
    }
    setMessage("Class published.");
    setClassTitle("");
    setClassDescription("");
    setClassDeliveryMethod("VIRTUAL");
    setClassLocationAddress("");
    loadClasses();
  }

  async function respond(enrollmentId: string, decision: "ACCEPTED" | "DECLINED") {
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) setMessage(body.error ?? "Couldn't respond to that request.");
    loadClasses();
  }

  if (!profile) return <main className="mx-auto max-w-4xl px-4 py-10">Loading…</main>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <h1 className="font-serif text-3xl text-palm-dark">Instructor dashboard</h1>
      {message && <p className="rounded-lg bg-palm/10 px-4 py-2 text-sm text-palm-dark">{message}</p>}

      {!profile.isCertified && (
        <div className="rounded-2xl border border-gold bg-gold/10 p-4 text-sm text-clay-dark">
          Your certification is still pending review. You can set up your profile now, but you won&apos;t be
          able to publish classes or go available on demand until an admin approves a certificate.
        </div>
      )}

      {connectStatus?.configured && (
        <section className="rounded-2xl border border-stone-200 p-5">
          <h2 className="font-serif text-xl text-clay-dark">Payouts</h2>
          {connectStatus.payoutsEnabled ? (
            <p className="mt-2 text-sm text-palm-dark">
              Your Stripe account is connected — you&apos;ll be paid automatically as soon as a booking is
              accepted.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-foreground/70">
                Connect a Stripe account so you can publish classes and get paid automatically for every booking.
              </p>
              <button
                onClick={connectStripe}
                disabled={connectLoading}
                className="mt-3 rounded-full bg-palm px-5 py-2 text-sm font-semibold text-white hover:bg-palm-dark disabled:opacity-60"
              >
                {connectLoading ? "One moment…" : connectStatus.connected ? "Finish connecting Stripe" : "Connect your Stripe account"}
              </button>
            </>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-xl text-clay-dark">Profile</h2>
        <label className="mt-3 block text-sm font-medium text-foreground/80">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />

        <p className="mt-4 text-sm font-medium text-foreground/80">Specialties (all &ldquo;inspired by&rdquo;)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allSpecialties.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleFrom(specialtyIds, s.id, setSpecialtyIds)}
              className={`rounded-full border px-3 py-1 text-sm ${specialtyIds.includes(s.id) ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium text-foreground/80">Languages you teach in</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allLanguages.map((l) => (
            <button
              key={l.id}
              onClick={() => toggleFrom(languageIds, l.id, setLanguageIds)}
              className={`rounded-full border px-3 py-1 text-sm ${languageIds.includes(l.id) ? "border-palm bg-palm text-white" : "border-stone-300 text-foreground/70"}`}
            >
              {l.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Add another language…"
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
          />
          <button onClick={addLanguage} className="rounded-full border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
            Add
          </button>
        </div>

        <button onClick={saveProfile} className="mt-4 rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
          Save profile
        </button>
      </section>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-xl text-clay-dark">Certification</h2>
        <p className="mt-1 text-sm text-foreground/70">Upload a certificate (PDF, PNG, or JPG) for review.</p>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => e.target.files?.[0] && uploadCertification(e.target.files[0])}
          className="mt-2 text-sm"
        />
        <ul className="mt-4 space-y-2">
          {profile.certifications.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm">
              <span>{c.fileName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  c.status === "APPROVED"
                    ? "bg-palm/15 text-palm-dark"
                    : c.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gold/20 text-gold"
                }`}
              >
                {c.status}
              </span>
            </li>
          ))}
          {profile.certifications.length === 0 && <p className="text-sm text-foreground/60">No certificates submitted yet.</p>}
        </ul>
      </section>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-xl text-clay-dark">On-demand availability</h2>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onDemandOn} onChange={(e) => setOnDemandOn(e.target.checked)} />
          I&apos;m available for on-demand sessions right now
        </label>
        <div className="mt-3 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70">Length</label>
            <select value={onDemandDuration} onChange={(e) => setOnDemandDuration(Number(e.target.value))} className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5">
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/70">Price per student ($)</label>
            <input type="number" step="0.5" value={onDemandPrice} onChange={(e) => setOnDemandPrice(Number(e.target.value))} className="mt-1 w-28 rounded-lg border border-stone-300 px-3 py-1.5" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/70">Capacity (blank = unlimited)</label>
            <input type="number" min={1} value={onDemandCapacity} onChange={(e) => setOnDemandCapacity(e.target.value)} className="mt-1 w-28 rounded-lg border border-stone-300 px-3 py-1.5" />
          </div>
        </div>
        <button onClick={saveOnDemand} className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
          Save on-demand settings
        </button>
      </section>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-xl text-clay-dark">In-person availability</h2>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={offersInPersonOn} onChange={(e) => setOffersInPersonOn(e.target.checked)} />
          I&apos;m available for in-person sessions at a client&apos;s home, office, or organization
        </label>
        <div className="mt-3 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70">Travel service area</label>
            <input
              placeholder="e.g. Greater Miami area"
              value={inPersonServiceArea}
              onChange={(e) => setInPersonServiceArea(e.target.value)}
              className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/70">Length</label>
            <select value={inPersonDuration} onChange={(e) => setInPersonDuration(Number(e.target.value))} className="mt-1 rounded-lg border border-stone-300 px-3 py-1.5">
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/70">Price per student ($)</label>
            <input type="number" step="0.5" value={inPersonPrice} onChange={(e) => setInPersonPrice(Number(e.target.value))} className="mt-1 w-28 rounded-lg border border-stone-300 px-3 py-1.5" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/70">Capacity (blank = unlimited)</label>
            <input type="number" min={1} value={inPersonCapacity} onChange={(e) => setInPersonCapacity(e.target.value)} className="mt-1 w-28 rounded-lg border border-stone-300 px-3 py-1.5" />
          </div>
        </div>
        <button onClick={saveInPerson} className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
          Save in-person settings
        </button>
      </section>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-xl text-clay-dark">Publish a scheduled class</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input placeholder="Title" value={classTitle} onChange={(e) => setClassTitle(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2" />
          <textarea placeholder="Description" value={classDescription} onChange={(e) => setClassDescription(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2" rows={2} />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => setClassDeliveryMethod("VIRTUAL")}
              className={`rounded-full border px-3 py-1 text-sm ${classDeliveryMethod === "VIRTUAL" ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}
            >
              Virtual
            </button>
            <button
              type="button"
              onClick={() => setClassDeliveryMethod("IN_PERSON")}
              className={`rounded-full border px-3 py-1 text-sm ${classDeliveryMethod === "IN_PERSON" ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}
            >
              In-person
            </button>
          </div>
          {classDeliveryMethod === "IN_PERSON" && (
            <input
              placeholder="Address (home, office, organization)"
              value={classLocationAddress}
              onChange={(e) => setClassLocationAddress(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
            />
          )}
          <input type="date" value={classDate} onChange={(e) => setClassDate(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2" />
          <input type="time" value={classTime} onChange={(e) => setClassTime(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2" />
          <select value={classDuration} onChange={(e) => setClassDuration(Number(e.target.value))} className="rounded-lg border border-stone-300 px-3 py-2">
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
          <input type="number" min={1} placeholder="Capacity (blank = unlimited)" value={classCapacity} onChange={(e) => setClassCapacity(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2" />
          <input type="number" step="0.5" placeholder="Price per student" value={classPrice} onChange={(e) => setClassPrice(Number(e.target.value))} className="rounded-lg border border-stone-300 px-3 py-2" />
        </div>

        <p className="mt-3 text-sm font-medium text-foreground/80">Specialties</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allSpecialties.map((s) => (
            <button key={s.id} onClick={() => toggleFrom(classSpecialtyIds, s.id, setClassSpecialtyIds)} className={`rounded-full border px-3 py-1 text-sm ${classSpecialtyIds.includes(s.id) ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}>
              {s.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-foreground/80">Languages</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allLanguages.map((l) => (
            <button key={l.id} onClick={() => toggleFrom(classLanguageIds, l.id, setClassLanguageIds)} className={`rounded-full border px-3 py-1 text-sm ${classLanguageIds.includes(l.id) ? "border-palm bg-palm text-white" : "border-stone-300 text-foreground/70"}`}>
              {l.name}
            </button>
          ))}
        </div>

        <button onClick={createClass} className="mt-4 rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
          Publish class
        </button>
      </section>

      <section>
        <h2 className="font-serif text-xl text-clay-dark">My classes</h2>
        <div className="mt-3 space-y-4">
          {classes.map((c) => (
            <div key={c.id} className="rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg">{c.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {new Date(c.startTime).toLocaleString()} · {c.durationMinutes} min · {c.mode} · {c.status}
                  </p>
                </div>
                {c.deliveryMethod === "VIRTUAL" ? (
                  <Link href={`/room/${c.id}`} className="rounded-full bg-palm px-4 py-1.5 text-sm font-semibold text-white hover:bg-palm-dark">
                    Video room
                  </Link>
                ) : (
                  <p className="text-sm text-foreground/70">
                    <span className="font-medium">In-person:</span> {c.locationAddress}
                  </p>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {c.enrollments.map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm">
                    <span>
                      {e.client.name} · ${(e.priceCharged - e.commissionAmount).toFixed(2)} you earn
                    </span>
                    {e.status === "PENDING" ? (
                      <span className="flex gap-2">
                        <button onClick={() => respond(e.id, "ACCEPTED")} className="rounded-full bg-palm px-3 py-1 text-xs font-semibold text-white hover:bg-palm-dark">
                          Accept
                        </button>
                        <button onClick={() => respond(e.id, "DECLINED")} className="rounded-full border border-stone-300 px-3 py-1 text-xs hover:bg-stone-100">
                          Decline
                        </button>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-foreground/60">{e.status}</span>
                    )}
                  </li>
                ))}
                {c.enrollments.length === 0 && <p className="text-sm text-foreground/50">No requests yet.</p>}
              </ul>
            </div>
          ))}
          {classes.length === 0 && <p className="text-foreground/60">No classes published yet.</p>}
        </div>
      </section>
    </main>
  );
}
