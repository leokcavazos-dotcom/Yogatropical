import { getI18n } from "@/i18n/server";

export default async function AboutPage() {
  const { t } = await getI18n();
  const a = t.about;
  const p = "mt-3 leading-relaxed text-foreground/90";
  const h2 = "font-display text-2xl text-flamingo";
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-mint">{a.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">{a.intro}</p>

      <section className="mt-10">
        <h2 className={h2}>{a.secularTitle}</h2>
        <p className={p}>{a.secularBody}</p>
        <blockquote className="mt-5 border-l-4 border-sunset pl-4 italic text-foreground/80">{a.serenity}</blockquote>
      </section>

      <section className="mt-10">
        <h2 className={h2}>{a.inspiredTitle}</h2>
        <p className={p}>{a.inspiredBody}</p>
      </section>

      <section className="mt-10">
        <h2 className={h2}>{a.languagesTitle}</h2>
        <p className={p}>{a.languagesBody}</p>
      </section>

      <section className="mt-10">
        <h2 className={h2}>{a.certTitle}</h2>
        <p className={p}>
          {a.certBodyBefore}{" "}
          <a href="/guidelines" className="underline hover:text-flamingo">
            {a.certLink}
          </a>{" "}
          {a.certBodyAfter}
        </p>
      </section>

      <section id="governance" className="mt-10 scroll-mt-24">
        <h2 className={h2}>{a.govTitle}</h2>
        <p className={p}>{a.govP1}</p>
        <p className={p}>{a.govP2}</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-foreground/90">
          <li>{a.govBullet1}</li>
          <li>{a.govBullet2}</li>
          <li>{a.govBullet3}</li>
        </ul>
        <p className={p}>{a.govP3}</p>
      </section>
    </main>
  );
}
