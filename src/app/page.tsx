import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="font-serif text-5xl leading-tight text-palm-dark sm:text-6xl">
          Move. Breathe. Stay grounded in your recovery.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80">
          Live, online yoga-inspired, tai chi-inspired, breathwork, and meditation classes — taught by certified
          instructors, in the language you practice in, at a length that fits your day.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/browse" className="rounded-full bg-clay px-6 py-3 font-semibold text-white hover:bg-clay-dark">
            Browse classes
          </Link>
          <Link href="/signup?role=INSTRUCTOR" className="rounded-full border border-palm px-6 py-3 font-semibold text-palm-dark hover:bg-sand">
            Teach with us
          </Link>
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl text-clay-dark">You choose the time</h3>
            <p className="mt-2 text-foreground/80">
              Pick a day, a length — 20 minutes up to 2 hours — and browse instructors with room in their
              schedule.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-clay-dark">Scheduled or on demand</h3>
            <p className="mt-2 text-foreground/80">
              Book a class in advance, or catch an instructor who&apos;s live and available right now.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-clay-dark">Any language, Pan-American</h3>
            <p className="mt-2 text-foreground/80">
              English, Spanish, Portuguese, French, Haitian Creole, Quechua, and more — including bilingual
              classes.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-serif text-3xl text-palm-dark">A secular, recovery-friendly space</h2>
        <p className="mt-4 text-foreground/80">
          Not affiliated with any religion — but a higher power, the serenity prayer, and the steps are
          welcome language here if that&apos;s part of your path. Every practice is offered as
          &ldquo;inspired by&rdquo; a tradition, taught by instructors we&apos;ve certified and continue to
          review.
        </p>
        <Link href="/about" className="mt-4 inline-block underline hover:text-clay">
          Read our full mission
        </Link>
      </section>
    </main>
  );
}
