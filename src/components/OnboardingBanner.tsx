import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";

export default async function OnboardingBanner() {
  const session = await auth();
  if (!session || session.user.role === "ADMIN") return null;

  const signed = await hasSignedCurrentWaiver(session.user.id);
  if (signed) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-clay-dark">
      <span>Finish setting up your account — it only takes a couple of minutes.</span>
      <Link href="/onboarding" className="rounded-full bg-gold px-4 py-1.5 font-semibold text-white hover:opacity-90">
        Finish onboarding
      </Link>
    </div>
  );
}
