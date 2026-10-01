"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(t.auth.loginError);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-mint">{t.auth.welcomeBack}</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 focus:border-flamingo focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-flamingo px-4 py-2 font-semibold text-ink hover:bg-flamingo-bright disabled:opacity-60"
        >
          {loading ? t.auth.signingIn : t.auth.signIn}
        </button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        {t.auth.newHere}{" "}
        <Link href="/signup" className="underline hover:text-flamingo">
          {t.auth.createAccountLink}
        </Link>
      </p>
    </main>
  );
}
