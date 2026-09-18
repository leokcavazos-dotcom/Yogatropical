import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function NavBar() {
  const session = await auth();

  const dashboardHref =
    session?.user.role === "INSTRUCTOR"
      ? "/dashboard/instructor"
      : session?.user.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/client";

  return (
    <header className="border-b border-sand bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl text-palm-dark">
          Yoga Tropical
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-foreground/80">
          <Link href="/browse" className="hover:text-clay">
            Browse classes
          </Link>
          <Link href="/about" className="hover:text-clay">
            Our mission
          </Link>
          <Link href="/guidelines" className="hover:text-clay">
            Guidelines
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="hover:text-clay">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="rounded-full border border-clay px-4 py-1.5 text-clay hover:bg-clay hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-clay">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full bg-clay px-4 py-1.5 text-white hover:bg-clay-dark">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
