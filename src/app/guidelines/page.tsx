import { WAIVER_TEXT } from "@/lib/waiver";

export default function GuidelinesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-palm-dark">Code of Conduct</h1>
      <p className="mt-4 leading-relaxed text-foreground/90">
        Classes happen live, on video, with real people showing up as they are. These guidelines keep the space
        warm, welcoming, and comfortable for everyone — instructors and students alike.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Health &amp; safety</h2>
        <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/90">{WAIVER_TEXT}</p>
        <p className="mt-3 text-sm text-foreground/60">
          You&apos;ll sign a short version of this during onboarding, before your first booking or class.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">What to wear on camera</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Wear whatever lets you move and breathe comfortably. We ask everyone — instructors and students,
          regardless of gender — to keep clothing on the modest, camera-appropriate side: fitted or
          semi-fitted activewear that covers the torso, midriff, and underwear fully, both standing and moving
          through a full range of motion. Think &ldquo;comfortable enough to stretch on the floor without
          worrying about it,&rdquo; not a specific outfit — that&apos;s about practicality, not enforcing a
          particular look. A few concrete guardrails:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-foreground/90">
          <li>Tops that stay in place and cover the midriff and chest during floor and inverted poses.</li>
          <li>Bottoms with enough coverage and opacity for seated, kneeling, and wide-legged positions.</li>
          <li>No swimwear, underwear-as-outerwear, or sheer fabric without something underneath.</li>
          <li>Shoes are optional and up to you and your practice — bare feet, grip socks, or sneakers are all fine.</li>
        </ul>
        <p className="mt-3 leading-relaxed text-foreground/90">
          This isn&apos;t about being strict for its own sake — it&apos;s about everyone feeling comfortable
          sharing a video room together. If you&apos;re unsure whether something works, err toward more
          coverage.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Recording and privacy</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Classes are recorded for quality review. Recordings are kept on file for a limited retention period
          (7 days by default) and only reviewed by our quality-control team, unless a class is flagged for
          follow-up, in which case the recording is held longer. Recordings are never shared publicly.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Respect and language</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          This is a secular space that welcomes recovery language — a higher power, the serenity prayer, the
          steps — without requiring it. Please don&apos;t proselytize a specific religion, and please describe
          practices as &ldquo;inspired by&rdquo; a tradition rather than claiming to teach that tradition
          directly.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-clay-dark">Instructor certification</h2>
        <p className="mt-3 leading-relaxed text-foreground/90">
          Instructors submit certification documents for review before they can publish classes. Our team (and
          eventually, an elected instructor council) periodically audits recorded classes for quality and
          adherence to these guidelines.
        </p>
      </section>
    </main>
  );
}
