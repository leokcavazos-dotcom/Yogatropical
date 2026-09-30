import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";

export default async function NavBar() {
  const session = await auth();

  const dashboardHref =
    session?.user.role === "INSTRUCTOR"
      ? "/dashboard/instructor"
      : session?.user.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/client";

  return (
    <header className="border-b border-line bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" aria-label="Yoga Tropical home" className="flex shrink-0 items-center gap-2 font-display text-xl text-mint">
          <Image src="/brand/logo-mark.png" alt="" width={40} height={40} className="h-10 w-10" priority />
          <span className="hidden sm:inline">Yoga Tropical</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-xs font-medium text-foreground/80 sm:gap-x-5 sm:text-sm [&>*]:whitespace-nowrap">
          <Link href="/browse" className="hover:text-flamingo">
            Browse classes
          </Link>
          <Link href="/about" className="hover:text-flamingo">
            Our mission
          </Link>
          <Link href="/recovery" className="hover:text-flamingo">
            Meetings
          </Link>
          <Link href="/guidelines" className="hover:text-flamingo">
            Guidelines
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="hover:text-flamingo">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="rounded-full border border-flamingo px-4 py-1.5 text-flamingo hover:bg-flamingo hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-flamingo">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full bg-flamingo px-4 py-1.5 text-ink hover:bg-flamingo-bright">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
