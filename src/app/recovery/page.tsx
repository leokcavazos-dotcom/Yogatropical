import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.recovery.metaTitle, description: t.recovery.intro };
}

// Every link points to the program's own official site. Checked September 30, 2026.
const LAST_CHECKED = new Date("2026-09-30T12:00:00Z");

type Recovery = Dictionary["recovery"];

interface MeetingLink {
  label: keyof Recovery["links"];
  suffix?: string;
  href: string;
}

interface Program {
  name: string; // official program names stay as-is in every language
  key: keyof Recovery["programs"];
  links: MeetingLink[];
}

const GROUPS: { title: "groupDrugs" | "groupSecular" | "groupFamily" | "groupOther"; intro?: "groupSecularIntro" | "groupFamilyIntro"; programs: Program[] }[] = [
  {
    title: "groupDrugs",
    programs: [
      {
        name: "Alcoholics Anonymous (AA)",
        key: "aa",
        links: [
          { label: "inPersonNearYou", href: "https://www.aa.org/find-aa" },
          { label: "onlinePhone", suffix: " (Online Intergroup)", href: "https://aa-intergroup.org/meetings/" },
        ],
      },
      {
        name: "Narcotics Anonymous (NA)",
        key: "na",
        links: [
          { label: "inPersonNearYou", href: "https://na.org/meetingsearch/" },
          { label: "onlinePhone", suffix: " (Virtual NA)", href: "https://virtual-na.org/" },
        ],
      },
      {
        name: "Cocaine Anonymous (CA)",
        key: "ca",
        links: [{ label: "inPersonOnlinePhone", href: "https://ca.org/meetings/" }],
      },
      {
        name: "Crystal Meth Anonymous (CMA)",
        key: "cma",
        links: [{ label: "worldwideDirectory", href: "https://www.crystalmeth.org/cma-meeting-directory/" }],
      },
      {
        name: "Marijuana Anonymous (MA)",
        key: "ma",
        links: [{ label: "inPersonOnlinePhone", href: "https://marijuana-anonymous.org/find-a-meeting/" }],
      },
      {
        name: "Heroin Anonymous (HA)",
        key: "ha",
        links: [{ label: "inPersonOnline", href: "https://heroinanonymous.org/meetings/" }],
      },
    ],
  },
  {
    title: "groupSecular",
    intro: "groupSecularIntro",
    programs: [
      {
        name: "SMART Recovery",
        key: "smart",
        links: [
          { label: "usCanada", href: "https://meetings.smartrecovery.org/meetings/" },
          { label: "otherCountries", href: "https://www.smartrecoveryinternational.org/meetings" },
        ],
      },
      {
        name: "Recovery Dharma",
        key: "dharma",
        links: [{ label: "inPersonOnline", href: "https://recoverydharma.org/meetings-and-events/" }],
      },
      {
        name: "LifeRing Secular Recovery",
        key: "lifering",
        links: [
          { label: "online", href: "https://lifering.org/meeting-menu/online-meetings/" },
          { label: "localInPerson", href: "https://lifering.org/meeting-menu/local-meetings/" },
        ],
      },
      {
        name: "Women for Sobriety",
        key: "wfs",
        links: [{ label: "inPersonOnline", href: "https://meetings.womenforsobriety.org/meetings/" }],
      },
      {
        name: "Secular AA",
        key: "secularAa",
        links: [{ label: "secularWorldwide", href: "https://secularaa.org/" }],
      },
    ],
  },
  {
    title: "groupFamily",
    intro: "groupFamilyIntro",
    programs: [
      {
        name: "Al-Anon & Alateen",
        key: "alAnon",
        links: [
          { label: "alAnon", href: "https://al-anon.org/al-anon-meetings/" },
          { label: "alateen", href: "https://al-anon.org/al-anon-meetings/find-an-alateen-meeting/" },
        ],
      },
      {
        name: "Nar-Anon & Narateen",
        key: "narAnon",
        links: [
          { label: "inPerson", href: "https://www.nar-anon.org/find-a-meeting" },
          { label: "virtual", href: "https://nar-anon.org/virtual-meetings" },
        ],
      },
      {
        name: "Gam-Anon",
        key: "gamAnon",
        links: [{ label: "inPersonVirtual", href: "https://gam-anon.org/meeting-directory" }],
      },
      {
        name: "Adult Children of Alcoholics (ACA)",
        key: "aca",
        links: [{ label: "inPersonOnline", href: "https://adultchildren.org/meeting-search/" }],
      },
      {
        name: "Co-Dependents Anonymous (CoDA)",
        key: "coda",
        links: [
          { label: "usInPerson", href: "https://coda.org/find-a-meeting/" },
          { label: "online", href: "https://coda.org/find-a-meeting/online-meetings/" },
        ],
      },
    ],
  },
  {
    title: "groupOther",
    programs: [
      {
        name: "Gamblers Anonymous (GA)",
        key: "ga",
        links: [
          { label: "findMeeting", href: "https://gamblersanonymous.org/find-a-meeting/" },
          { label: "virtual", href: "https://gamblersanonymous.org/virtual-meetings/" },
        ],
      },
      {
        name: "Overeaters Anonymous (OA)",
        key: "oa",
        links: [{ label: "inPersonOnlinePhone", href: "https://oa.org/find-a-meeting/" }],
      },
      {
        name: "Nicotine Anonymous",
        key: "nicotine",
        links: [{ label: "inPersonOnlinePhone", href: "https://nicotine-anonymous.org/find-a-meeting/" }],
      },
      {
        name: "Sex and Love Addicts Anonymous (SLAA)",
        key: "slaa",
        links: [{ label: "inPersonOnlinePhone", href: "https://slaafws.org/meetings/" }],
      },
      {
        name: "Sex Addicts Anonymous (SAA)",
        key: "saa",
        links: [{ label: "meetingsTab", href: "https://saa-recovery.org/" }],
      },
      {
        name: "Debtors Anonymous (DA)",
        key: "da",
        links: [
          { label: "inPerson", href: "https://debtorsanonymous.org/meeting-search-f2f/" },
          { label: "onlinePhone", href: "https://debtorsanonymous.org/meeting-search-virtual/" },
        ],
      },
    ],
  },
];

export default async function RecoveryPage() {
  const { locale, t } = await getI18n();
  const r = t.recovery;
  const checked = LAST_CHECKED.toLocaleDateString(locale, { dateStyle: "long", timeZone: "UTC" });
  const external = "underline hover:text-flamingo";
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-mint">{r.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">{r.intro}</p>

      <section className="mt-8 rounded-2xl border border-sunset/50 bg-surface p-5">
        <h2 className="font-display text-xl text-sunset">{r.helpTitle}</h2>
        <ul className="mt-3 space-y-2 text-foreground/90">
          <li>
            <strong>{r.emergencyLabel}</strong> {r.emergencyBody}
          </li>
          <li>
            <strong>{r.lifelineLabel}</strong> {r.lifelineBody}{" "}
            <a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer" className={external}>
              {r.lifelineChat}
            </a>
            . {r.lifelineSpanish}
          </li>
          <li>
            <strong>{r.samhsaLabel}</strong> {r.samhsaBody}{" "}
            <a href="https://findtreatment.gov/" target="_blank" rel="noopener noreferrer" className={external}>
              {r.findTreatment}
            </a>
            .
          </li>
        </ul>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="font-display text-2xl text-flamingo">{r[group.title]}</h2>
          {group.intro && <p className="mt-2 text-foreground/80">{r[group.intro]}</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {group.programs.map((p) => (
              <div key={p.name} className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                <p className="mt-1 text-sm text-foreground/70">{r.programs[p.key]}</p>
                <ul className="mt-3 space-y-1">
                  {p.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-mint underline-offset-2 hover:text-mint-bright hover:underline"
                      >
                        {r.links[l.label]}
                        {l.suffix} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-12 text-sm text-foreground/60">{fmt(r.disclaimer, { date: checked })}</p>
    </main>
  );
}
