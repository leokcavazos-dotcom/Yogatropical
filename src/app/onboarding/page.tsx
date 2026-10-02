"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WelcomeVideo from "@/components/WelcomeVideo";
import PaymentMethodStep from "@/components/onboarding/PaymentMethodStep";
import PhotoUploader from "@/components/PhotoUploader";
import { WAIVER_TEXT } from "@/lib/waiver";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

interface Tag {
  id: string;
  name: string;
}
interface OnboardingStatus {
  id: string;
  hasPhoto: boolean;
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

export default function OnboardingPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const o = t.onboarding;
  const STEP_LABELS = o.steps;
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
        // Pick up where they left off: past the welcome and profile if they've done those before.
        if (s.waiverSigned) setStep(3);
        else if (s.onboardingCompletedAt) setStep(2);
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
        setMessage(body.error ?? o.saveProfileError);
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
      setMessage(o.mustCheck);
      return;
    }
    const res = await fetch("/api/onboarding/waiver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? o.signError);
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
    return <main className="mx-auto max-w-xl px-4 py-16 text-center text-foreground/60">{t.common.loading}</main>;
  }

  const isInstructor = status.role === "INSTRUCTOR";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-flamingo" : "bg-line"}`} />
        ))}
      </div>
      <p className="mb-4 text-center text-xs uppercase tracking-wide text-foreground/50">{STEP_LABELS[step]}</p>

      {message && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">{message}</p>}

      {step === 0 && (
        <div className="space-y-5 text-center">
          <WelcomeVideo
            src={isInstructor ? process.env.NEXT_PUBLIC_WELCOME_VIDEO_INSTRUCTOR_URL : process.env.NEXT_PUBLIC_WELCOME_VIDEO_CLIENT_URL}
            fallbackHeadline={isInstructor ? o.welcomeInstructorTitle : o.welcomeClientTitle}
            fallbackBody={isInstructor ? o.welcomeInstructorBody : o.welcomeClientBody}
          />
          <p className="text-sm text-foreground/70">
            {o.quick}
          </p>
          <button onClick={() => goTo(1)} className="w-full rounded-full bg-flamingo px-4 py-2.5 font-semibold text-ink hover:bg-flamingo-bright">
            {o.letsGo}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-mint">
            {isInstructor ? o.profileInstructorTitle : o.profileClientTitle}
          </h2>

          <PhotoUploader
            userId={status.id}
            name={status.name}
            hasPhoto={status.hasPhoto}
            note={isInstructor ? o.photoInstructorNote : o.photoClientNote}
            onChange={(hasPhoto) => setStatus({ ...status, hasPhoto })}
          />

          {isInstructor && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground/80">{o.shortBio}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/80">{o.specialties}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allSpecialties.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggle(specialtyIds, s.id, setSpecialtyIds)}
                      className={`rounded-full border px-3 py-1 text-sm ${specialtyIds.includes(s.id) ? "border-flamingo bg-flamingo text-ink" : "border-line text-foreground/70"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/80">{o.languagesTeach}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allLanguages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => toggle(languageIds, l.id, setLanguageIds)}
                      className={`rounded-full border px-3 py-1 text-sm ${languageIds.includes(l.id) ? "border-mint bg-mint text-ink" : "border-line text-foreground/70"}`}
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
              <label className="block text-sm font-medium text-foreground/80">{o.preferredLanguage}</label>
              <select
                value={preferredLanguageId}
                onChange={(e) => setPreferredLanguageId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              >
                <option value="">{o.noPreference}</option>
                {allLanguages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/80">{o.phone}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={o.phonePlaceholder}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </div>

          <button onClick={saveProfileStep} className="w-full rounded-full bg-flamingo px-4 py-2.5 font-semibold text-ink hover:bg-flamingo-bright">
            {t.common.continue}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-mint">{o.safetyTitle}</h2>
          {locale !== "en" && <p className="text-xs text-foreground/60">{o.waiverEnglishNote}</p>}
          <div className="max-h-56 overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-surface-2 p-4 text-sm text-foreground/80">
            {WAIVER_TEXT}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">{o.signName}</label>
            <input
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-foreground/80">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
            <span>{o.agree}</span>
          </label>
          <button onClick={signWaiver} className="w-full rounded-full bg-flamingo px-4 py-2.5 font-semibold text-ink hover:bg-flamingo-bright">
            {o.signContinue}
          </button>
        </div>
      )}

      {step === 3 && <PaymentMethodStep role={status.role} onSkip={() => goTo(4)} />}

      {step === 4 && (
        <div className="space-y-5 text-center">
          <h2 className="font-display text-2xl text-mint">{fmt(o.doneTitle, { name: status.name.split(" ")[0] })}</h2>
          <p className="text-sm text-foreground/70">
            {isInstructor ? o.doneInstructor : o.doneClient}
          </p>
          <Link href="/room/test" className="block text-sm text-mint underline hover:text-mint-bright">
            🎥 {t.room.testLink}
          </Link>
          <button onClick={finish} className="w-full rounded-full bg-flamingo px-4 py-2.5 font-semibold text-ink hover:bg-flamingo-bright">
            {isInstructor ? o.goDashboard : o.browseClasses}
          </button>
        </div>
      )}
    </main>
  );
}
