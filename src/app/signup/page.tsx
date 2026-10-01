"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const initialRole = searchParams.get("role") === "INSTRUCTOR" ? "INSTRUCTOR" : "CLIENT";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "INSTRUCTOR">(initialRole);
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!acceptedGuidelines) {
      setError(t.auth.mustAgree);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, acceptedGuidelines }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? t.auth.signupError);
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-mint">{t.auth.joinTitle}</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${role === "CLIENT" ? "border-flamingo bg-flamingo text-ink" : "border-line text-foreground/70"}`}
          >
            {t.auth.takeClasses}
          </button>
          <button
            type="button"
            onClick={() => setRole("INSTRUCTOR")}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${role === "INSTRUCTOR" ? "border-mint bg-mint text-ink" : "border-line text-foreground/70"}`}
          >
            {t.auth.teach}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">{t.auth.name}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-flamingo focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">{t.auth.email}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-flamingo focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">{t.auth.password}</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-flamingo focus:outline-none"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={acceptedGuidelines}
            onChange={(e) => setAcceptedGuidelines(e.target.checked)}
            className="mt-1"
          />
          <span>
            {t.auth.agreeGuidelines}{" "}
            <Link href="/guidelines" target="_blank" className="underline hover:text-flamingo">
              {t.auth.guidelinesLink}
            </Link>{" "}
            {t.auth.agreeGuidelinesAfter}
          </span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-flamingo px-4 py-2 font-semibold text-ink hover:bg-flamingo-bright disabled:opacity-60"
        >
          {loading ? t.auth.creatingAccount : t.auth.createAccount}
        </button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="underline hover:text-flamingo">
          {t.auth.signInLink}
        </Link>
      </p>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
