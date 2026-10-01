import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getI18n } from "@/i18n/server";

export default async function NavBar() {
  const [session, { t }] = await Promise.all([auth(), getI18n()]);

  const dashboardHref =
    session?.user.role === "INSTRUCTOR"
      ? "/dashboard/instructor"
      : session?.user.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/client";

  return (
    <header className="border-b border-line bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" aria-label={t.nav.home} className="flex shrink-0 items-center gap-2 font-display text-xl text-mint">
          <Image src="/brand/logo-mark.png" alt="" width={40} height={40} className="h-10 w-10" priority />
          <span className="hidden sm:inline">Yoga Tropical</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-xs font-medium text-foreground/80 sm:gap-x-5 sm:text-sm [&>*]:whitespace-nowrap">
          <Link href="/browse" className="hover:text-flamingo">
            {t.nav.browse}
          </Link>
          <Link href="/about" className="hover:text-flamingo">
            {t.nav.mission}
          </Link>
          <Link href="/recovery" className="hover:text-flamingo">
            {t.nav.meetings}
          </Link>
          <Link href="/store" className="hover:text-flamingo">
            {t.nav.store}
          </Link>
          <Link href="/guidelines" className="hover:text-flamingo">
            {t.nav.guidelines}
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="hover:text-flamingo">
                {t.nav.dashboard}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="rounded-full border border-flamingo px-4 py-1.5 text-flamingo hover:bg-flamingo hover:text-ink">
                  {t.nav.signOut}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-flamingo">
                {t.nav.signIn}
              </Link>
              <Link href="/signup" className="rounded-full bg-flamingo px-4 py-1.5 text-ink hover:bg-flamingo-bright">
                {t.nav.getStarted}
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
