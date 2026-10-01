import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasSignedCurrentWaiver } from "@/lib/onboarding";
import { getI18n } from "@/i18n/server";

export default async function OnboardingBanner() {
  const session = await auth();
  if (!session || session.user.role === "ADMIN") return null;

  const signed = await hasSignedCurrentWaiver(session.user.id);
  if (signed) return null;
  const { t } = await getI18n();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sunset/40 bg-sunset/10 px-4 py-3 text-sm text-flamingo">
      <span>{t.onboarding.banner}</span>
      <Link href="/onboarding" className="rounded-full bg-sunset px-4 py-1.5 font-semibold text-ink hover:opacity-90">
        {t.onboarding.bannerCta}
      </Link>
    </div>
  );
}
