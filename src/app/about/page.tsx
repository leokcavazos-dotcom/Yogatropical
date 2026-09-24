export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-palm-dark">Our mission</h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">
        Yoga Tropical is a home for movement, breath, and stillness practices for people building a life in
        recovery. We believe a body that moves and a mind that breathes on purpose are part of walking a
        virtuous, sober path — whatever that means for you.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">A secular space, open to any higher power</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          We are not affiliated with any religion. At the same time, we don&apos;t shy away from the language
          many people in recovery already use — a higher power, the serenity prayer, the steps. Use as much or
          as little of that language as serves you. Everything else — the specific tradition an instructor draws
          from — stays in the background.
        </p>
        <blockquote className="mt-5 border-l-4 border-gold pl-4 italic text-foreground/80">
          &ldquo;Grant us the serenity to accept the things we cannot change, the courage to change the things we
          can, and the wisdom to know the difference.&rdquo;
        </blockquote>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Why every class is described as &ldquo;inspired&rdquo;</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          You&apos;ll see classes described as Ashtanga-inspired, Hatha-inspired, Kundalini-inspired, Tai
          Chi-inspired, and so on — never simply &ldquo;Ashtanga&rdquo; or &ldquo;Kundalini.&rdquo; That&apos;s
          intentional. These are movement and breath practices adapted for a secular, recovery-focused setting,
          not religious instruction, and we want that distinction to be unmistakable.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Pan-American, in whatever language you practice</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Our instructors teach in English, Spanish, Portuguese, French, Haitian Creole, Quechua, and more —
          whatever language they speak and a student wants to practice in, including hybrid, bilingual classes.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Certification and quality</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Every instructor submits certification documents that our team reviews before they can publish or
          teach a class. Classes are recorded for quality review and kept on file for a limited retention
          period (currently 7 days, longer if a class is flagged for follow-up). See our{" "}
          <a href="/guidelines" className="underline hover:text-clay">
            Code of Conduct
          </a>{" "}
          for what we look for.
        </p>
      </section>

      <section id="governance" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl text-clay-dark">Where we&apos;re headed: from LLC to cooperative</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          For our first three years, Yoga Tropical operates as an LLC. That&apos;s a deliberate, practical
          choice — it lets us get the platform, certification process, and instructor community right before
          taking on the added complexity of shared governance.
        </p>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Our stated goal beyond that point is to become an instructor cooperative. The details are still being
          worked out, but the direction we&apos;re building toward is:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-foreground/90">
          <li>
            Instructors who have taught on the platform for at least one year, averaging at least 20 hours of
            classes per week, become voting members of the cooperative.
          </li>
          <li>
            Voting members elect an instructor council that handles day-to-day decisions — including quality
            control and teacher regulation.
          </li>
          <li>
            We&apos;re also exploring capping the platform&apos;s commission per booking (a rough figure under
            discussion is around $100) and, once the cooperative is running, sharing a portion of that
            commission revenue back with instructors — a profit-sharing pool, weighted by how much someone
            taught, on top of their regular class earnings. The exact percentage and formula are still being
            defined; nothing here is a promise of a specific number, and none of it applies during the LLC
            years.
          </li>
        </ul>
        <p className="mt-3 leading-relaxed text-foreground/90">
          We&apos;re sharing the plan even while it&apos;s unfinished because we&apos;d rather be transparent
          about where this is going than pretend we have it all figured out.
        </p>
      </section>
    </main>
  );
}
