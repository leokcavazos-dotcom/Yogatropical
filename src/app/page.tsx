import Link from "next/link";
import Image from "next/image";
import AdBar from "@/components/AdBar";
import { getI18n } from "@/i18n/server";

export default async function Home() {
  const { t } = await getI18n();
  const features = [
    [t.home.feature1Title, t.home.feature1Body],
    [t.home.feature2Title, t.home.feature2Body],
    [t.home.feature3Title, t.home.feature3Body],
  ];
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-10 text-center">
        <Image
          src="/brand/logo-lockup.png"
          alt="Yoga Tropical"
          width={396}
          height={518}
          priority
          className="mx-auto mb-6 h-auto w-44 sm:w-56"
        />
        <h1 className="font-display text-5xl leading-tight text-mint sm:text-6xl">{t.home.heroTitle}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80">{t.home.heroBody}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/browse" className="rounded-full bg-flamingo px-6 py-3 font-semibold text-ink hover:bg-flamingo-bright">
            {t.home.browseCta}
          </Link>
          <Link href="/signup?role=INSTRUCTOR" className="rounded-full border border-mint px-6 py-3 font-semibold text-mint hover:bg-surface-2">
            {t.home.teachCta}
          </Link>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
          {features.map(([title, body]) => (
            <div key={title}>
              <h3 className="font-display text-xl text-flamingo">{title}</h3>
              <p className="mt-2 text-foreground/80">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-mint">{t.home.secularTitle}</h2>
        <p className="mt-4 text-foreground/80">{t.home.secularBody}</p>
        <Link href="/about" className="mt-4 inline-block underline hover:text-flamingo">
          {t.home.readMission}
        </Link>
      </section>

      <div className="px-4 pb-12">
        <AdBar placement="HOME" />
      </div>
    </main>
  );
}
