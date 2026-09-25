"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import WelcomeVideo from "@/components/WelcomeVideo";
import PaymentMethodStep from "@/components/onboarding/PaymentMethodStep";
import { WAIVER_TEXT } from "@/lib/waiver";

interface Tag {
  id: string;
  name: string;
}
interface OnboardingStatus {
  role: "CLIENT" | "INSTRUCTOR" | "ADMIN";
  name: string;
  phone: string | null;
  preferredLanguageId: string | null;
  waiverSigned: boolean;
  onboardingCompletedAt: string | null;
  instructorProfile: {
    bio: string;
    specialties: Tag[];
    languages: Tag[];
  } | null;
}

const STEP_LABELS = ["Welcome", "Your profile", "Safety", "Payment", "Done"];

export default function OnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [preferredLanguageId, setPreferredLanguageId] = useState("");
  const [bio, setBio] = useState("");
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);
  const [languageIds, setLanguageIds] = useState<string[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<Tag[]>([]);
  const [allLanguages, setAllLanguages] = useState<Tag[]>([]);

  const [signedName, setSignedName] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((s: OnboardingStatus) => {
        setStatus(s);
        setPhone(s.phone ?? "");
        setPreferredLanguageId(s.preferredLanguageId ?? "");
        if (s.instructorProfile) {
          setBio(s.instructorProfile.bio);
          setSpecialtyIds(s.instructorProfile.specialties.map((t) => t.id));
          setLanguageIds(s.instructorProfile.languages.map((t) => t.id));
        }
      });
    fetch("/api/languages").then((r) => r.json()).then(setAllLanguages);
    fetch("/api/specialties").then((r) => r.json()).then(setAllSpecialties);
  }, []);

  const goTo = useCallback((n: number) => {
    setMessage(null);
    setStep(n);
  }, []);

  function toggle(list: string[], id: string, setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function saveProfileStep() {
    setMessage(null);
    if (status?.role === "INSTRUCTOR") {
      const res = await fetch("/api/instructor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, specialtyIds, languageIds }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage(body.error ?? "Couldn't save your profile.");
        return;
      }
    }
    await fetch("/api/onboarding/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, preferredLanguageId: preferredLanguageId || null }),
    });
    goTo(2);
  }

  async function signWaiver() {
    setMessage(null);
    if (!agreed) {
      setMessage("Please check the box to confirm you've read this.");
      return;
    }
    const res = await fetch("/api/onboarding/waiver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Couldn't record your signature.");
      return;
    }
    goTo(3);
  }

  async function finish() {
    await fetch("/api/onboarding/complete", { method: "PATCH" });
    router.push(status?.role === "INSTRUCTOR" ? "/dashboard/instructor" : "/browse");
    router.refresh();
  }

  if (!status) {
    return <main className="mx-auto max-w-xl px-4 py-16 text-center text-foreground/60">Loading…</main>;
  }

  const isInstructor = status.role === "INSTRUCTOR";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-clay" : "bg-stone-200"}`} />
        ))}
      </div>
      <p className="mb-4 text-center text-xs uppercase tracking-wide text-foreground/50">{STEP_LABELS[step]}</p>

      {message && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{message}</p>}

      {step === 0 && (
        <div className="space-y-5 text-center">
          <WelcomeVideo
            src={isInstructor ? process.env.NEXT_PUBLIC_WELCOME_VIDEO_INSTRUCTOR_URL : process.env.NEXT_PUBLIC_WELCOME_VIDEO_CLIENT_URL}
            fallbackHeadline={isInstructor ? "Welcome to Yoga Tropical, instructor" : "Welcome to Yoga Tropical"}
            fallbackBody={
              isInstructor
                ? "A warm, secular, recovery-friendly space to share movement, breath, and stillness — in your language, on your schedule."
                : "Live, online movement, breath, and meditation classes — welcoming, secular, and rooted in recovery. Let's get you set up in a couple of minutes."
            }
          />
          <p className="text-sm text-foreground/70">
            This will only take a couple of minutes — a quick profile, a short safety note, and you&apos;re in.
          </p>
          <button onClick={() => goTo(1)} className="w-full rounded-full bg-clay px-4 py-2.5 font-semibold text-white hover:bg-clay-dark">
            Let&apos;s go
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-palm-dark">
            {isInstructor ? "Tell us about your teaching" : "A couple of quick details"}
          </h2>

          {isInstructor && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground/80">Short bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/80">Specialties (all &ldquo;inspired by&rdquo;)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allSpecialties.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggle(specialtyIds, s.id, setSpecialtyIds)}
                      className={`rounded-full border px-3 py-1 text-sm ${specialtyIds.includes(s.id) ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/80">Languages you teach in</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allLanguages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => toggle(languageIds, l.id, setLanguageIds)}
                      className={`rounded-full border px-3 py-1 text-sm ${languageIds.includes(l.id) ? "border-palm bg-palm text-white" : "border-stone-300 text-foreground/70"}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isInstructor && (
            <div>
              <label className="block text-sm font-medium text-foreground/80">Preferred language</label>
              <select
                value={preferredLanguageId}
                onChange={(e) => setPreferredLanguageId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              >
                <option value="">No preference</option>
                {allLanguages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/80">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For class reminders — never shared"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>

          <button onClick={saveProfileStep} className="w-full rounded-full bg-clay px-4 py-2.5 font-semibold text-white hover:bg-clay-dark">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-palm-dark">A quick safety note</h2>
          <div className="max-h-56 overflow-y-auto whitespace-pre-line rounded-xl border border-stone-200 bg-sand/40 p-4 text-sm text-foreground/80">
            {WAIVER_TEXT}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Type your full name to sign</label>
            <input
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-foreground/80">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
            <span>I&apos;ve read this and understand it applies to every class I take or teach here.</span>
          </label>
          <button onClick={signWaiver} className="w-full rounded-full bg-clay px-4 py-2.5 font-semibold text-white hover:bg-clay-dark">
            Sign and continue
          </button>
        </div>
      )}

      {step === 3 && <PaymentMethodStep role={status.role} onSkip={() => goTo(4)} />}

      {step === 4 && (
        <div className="space-y-5 text-center">
          <h2 className="font-serif text-2xl text-palm-dark">You&apos;re all set, {status.name.split(" ")[0]}</h2>
          <p className="text-sm text-foreground/70">
            {isInstructor
              ? "Head to your dashboard to upload a certificate and publish your first class."
              : "Head over to browse classes and find something that fits your day."}
          </p>
          <button onClick={finish} className="w-full rounded-full bg-clay px-4 py-2.5 font-semibold text-white hover:bg-clay-dark">
            {isInstructor ? "Go to my dashboard" : "Browse classes"}
          </button>
        </div>
      )}
    </main>
  );
}
