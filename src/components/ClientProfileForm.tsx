"use client";

import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { CLIENT_AGE_RANGES } from "@/lib/profileOptions";
import PhotoUploader from "@/components/PhotoUploader";

interface Tag {
  id: string;
  name: string;
}
interface ClientProfileResponse {
  userId: string;
  name: string;
  hasPhoto: boolean;
  profile: {
    aboutMe: string;
    whatBringsYou: string;
    ageRange: string | null;
    notesForInstructors: string;
    prefersVirtual: boolean;
    prefersInPerson: boolean;
    country: string | null;
    area: string | null;
    languages: Tag[];
  } | null;
}

const EMPTY = {
  aboutMe: "",
  whatBringsYou: "",
  ageRange: "",
  notesForInstructors: "",
  prefersVirtual: true,
  prefersInPerson: false,
  country: "",
  area: "",
  languageIds: [] as string[],
};

export default function ClientProfileForm() {
  const [data, setData] = useState<ClientProfileResponse | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [allLanguages, setAllLanguages] = useState<Tag[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/languages").then((r) => r.json()).then(setAllLanguages);
    fetch("/api/me/client-profile")
      .then((r) => r.json())
      .then((res: ClientProfileResponse) => {
        setData(res);
        const p = res.profile;
        if (p) {
          setForm({
            aboutMe: p.aboutMe,
            whatBringsYou: p.whatBringsYou,
            ageRange: p.ageRange ?? "",
            notesForInstructors: p.notesForInstructors,
            prefersVirtual: p.prefersVirtual,
            prefersInPerson: p.prefersInPerson,
            country: p.country ?? "",
            area: p.area ?? "",
            languageIds: p.languages.map((l) => l.id),
          });
        }
      });
  }, []);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setMessage(null);
    const res = await fetch("/api/me/client-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ageRange: form.ageRange || null,
        country: form.country || null,
        area: form.area.trim() || null,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Profile saved." : body.error ?? "Couldn't save your profile.");
  }

  if (!data) return null;

  return (
    <section className="rounded-2xl border border-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-flamingo">My profile</h2>
        <button onClick={() => setOpen(!open)} className="text-sm text-mint underline hover:text-mint-bright">
          {open ? "Hide" : data.profile ? "Edit" : "Fill it out"}
        </button>
      </div>
      <p className="mt-1 text-xs text-foreground/60">
        🔒 Private. Only instructors you request or book with (and our small admin team) can see it. Everything is
        optional — share only what helps an instructor take good care of you.
      </p>

      {open && (
        <div className="mt-4 space-y-4">
          <PhotoUploader
            userId={data.userId}
            name={data.name}
            hasPhoto={data.hasPhoto}
            note="Optional."
            onChange={(hasPhoto) => setData({ ...data, hasPhoto })}
          />

          <div>
            <label className="block text-sm font-medium text-foreground/80">What brings you to Yoga Tropical?</label>
            <textarea
              value={form.whatBringsYou}
              onChange={(e) => set("whatBringsYou", e.target.value)}
              rows={2}
              placeholder="e.g. Staying grounded in early recovery, easing back pain, calming anxiety…"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">A little about me</label>
            <textarea
              value={form.aboutMe}
              onChange={(e) => set("aboutMe", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Anything instructors should know?</label>
            <textarea
              value={form.notesForInstructors}
              onChange={(e) => set("notesForInstructors", e.target.value)}
              rows={2}
              placeholder="Injuries, limitations, pregnancy, or preferences (like no hands-on adjustments)."
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/70">Age range</label>
              <select value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)} className="mt-1 rounded-lg border border-line px-3 py-1.5">
                <option value="">Prefer not to say</option>
                {CLIENT_AGE_RANGES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70">Country</label>
              <select value={form.country} onChange={(e) => set("country", e.target.value)} className="mt-1 rounded-lg border border-line px-3 py-1.5">
                <option value="">Choose…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70">City or area</label>
              <input
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                maxLength={200}
                placeholder="e.g. Miami"
                className="mt-1 rounded-lg border border-line px-3 py-1.5"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground/80">I like classes that are…</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.prefersVirtual} onChange={(e) => set("prefersVirtual", e.target.checked)} />
                Virtual
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.prefersInPerson} onChange={(e) => set("prefersInPerson", e.target.checked)} />
                In person
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground/80">Languages I&apos;m comfortable in</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {allLanguages.map((l) => {
                const on = form.languageIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => set("languageIds", on ? form.languageIds.filter((x) => x !== l.id) : [...form.languageIds, l.id])}
                    className={`rounded-full border px-3 py-1 text-sm ${on ? "border-mint bg-mint text-ink" : "border-line text-foreground/70"}`}
                  >
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>

          {message && <p className="text-sm text-mint">{message}</p>}
          <button onClick={save} className="rounded-full bg-flamingo px-5 py-2 text-sm font-semibold text-ink hover:bg-flamingo-bright">
            Save profile
          </button>
        </div>
      )}
    </section>
  );
}
