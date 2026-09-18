"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError("Please confirm you've read our Code of Conduct.");
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
      setError(body.error ?? "Something went wrong creating your account.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push(role === "INSTRUCTOR" ? "/dashboard/instructor" : "/dashboard/client");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-palm-dark">Join Yoga Tropical</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${role === "CLIENT" ? "border-clay bg-clay text-white" : "border-stone-300 text-foreground/70"}`}
          >
            I want to take classes
          </button>
          <button
            type="button"
            onClick={() => setRole("INSTRUCTOR")}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${role === "INSTRUCTOR" ? "border-palm bg-palm text-white" : "border-stone-300 text-foreground/70"}`}
          >
            I want to teach
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-clay focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-clay focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-clay focus:outline-none"
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
            I&apos;ve read and agree to the{" "}
            <Link href="/guidelines" target="_blank" className="underline hover:text-clay">
              Code of Conduct
            </Link>{" "}
            (including on-camera dress guidelines and recording policy).
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-clay px-4 py-2 font-semibold text-white hover:bg-clay-dark disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        Already have an account?{" "}
        <Link href="/login" className="underline hover:text-clay">
          Sign in
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
