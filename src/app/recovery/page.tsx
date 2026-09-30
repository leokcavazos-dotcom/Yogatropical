import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recovery meetings — Yoga Tropical",
  description: "Official meeting finders for 12-step and secular recovery programs, in person and online.",
};

// Every link points to the program's own official site. Checked September 30, 2026.
const LAST_CHECKED = "September 30, 2026";

interface MeetingLink {
  label: string;
  href: string;
}

interface Program {
  name: string;
  about: string;
  links: MeetingLink[];
}

const GROUPS: { title: string; intro?: string; programs: Program[] }[] = [
  {
    title: "Alcohol and drugs (12-step)",
    programs: [
      {
        name: "Alcoholics Anonymous (AA)",
        about: "For anyone who wants to stop drinking. Meetings worldwide, in many languages.",
        links: [
          { label: "In-person meetings near you", href: "https://www.aa.org/find-aa" },
          { label: "Online & phone meetings (Online Intergroup)", href: "https://aa-intergroup.org/meetings/" },
        ],
      },
      {
        name: "Narcotics Anonymous (NA)",
        about: "For anyone who wants to stop using drugs, any drug.",
        links: [
          { label: "In-person meetings near you", href: "https://na.org/meetingsearch/" },
          { label: "Online & phone meetings (Virtual NA)", href: "https://virtual-na.org/" },
        ],
      },
      {
        name: "Cocaine Anonymous (CA)",
        about: "Recovery from cocaine and all other mind-altering substances.",
        links: [{ label: "In-person, online & phone meetings", href: "https://ca.org/meetings/" }],
      },
      {
        name: "Crystal Meth Anonymous (CMA)",
        about: "Recovery from crystal meth addiction.",
        links: [{ label: "Worldwide meeting directory (in-person & online)", href: "https://www.crystalmeth.org/cma-meeting-directory/" }],
      },
      {
        name: "Marijuana Anonymous (MA)",
        about: "Recovery from cannabis addiction. Room for all beliefs, or none.",
        links: [{ label: "In-person, online & phone meetings", href: "https://marijuana-anonymous.org/find-a-meeting/" }],
      },
      {
        name: "Heroin Anonymous (HA)",
        about: "Recovery from heroin and opioid addiction.",
        links: [{ label: "In-person & online meetings", href: "https://heroinanonymous.org/meetings/" }],
      },
    ],
  },
  {
    title: "Secular and non-12-step options",
    intro: "Prefer a path without the steps or a higher power? These are peer-led too, and free.",
    programs: [
      {
        name: "SMART Recovery",
        about: "Science-based, self-empowering tools for any addictive behavior. Family & Friends meetings too.",
        links: [
          { label: "US & Canada meetings (in-person & online)", href: "https://meetings.smartrecovery.org/meetings/" },
          { label: "Meetings in other countries", href: "https://www.smartrecoveryinternational.org/meetings" },
        ],
      },
      {
        name: "Recovery Dharma",
        about: "Meditation and mindfulness-based recovery from any addiction.",
        links: [{ label: "In-person & online meetings", href: "https://recoverydharma.org/meetings-and-events/" }],
      },
      {
        name: "LifeRing Secular Recovery",
        about: "Sobriety, secularity, and self-help. No prayer or religion in meetings.",
        links: [
          { label: "Online meetings", href: "https://lifering.org/meeting-menu/online-meetings/" },
          { label: "Local in-person meetings", href: "https://lifering.org/meeting-menu/local-meetings/" },
        ],
      },
      {
        name: "Women for Sobriety",
        about: "Secular, peer-facilitated meetings for women (18+).",
        links: [{ label: "In-person & online meetings", href: "https://meetings.womenforsobriety.org/meetings/" }],
      },
      {
        name: "Secular AA",
        about: "AA meetings for atheists, agnostics, and anyone who wants them without religious language.",
        links: [{ label: "Secular AA meetings worldwide", href: "https://secularaa.org/" }],
      },
    ],
  },
  {
    title: "For family and friends",
    intro: "Someone else's drinking, drug use, or gambling affects you too. These groups are for you.",
    programs: [
      {
        name: "Al-Anon & Alateen",
        about: "For families and friends of alcoholics. Alateen is for teens 13–18.",
        links: [
          { label: "Al-Anon in-person, phone & online meetings", href: "https://al-anon.org/al-anon-meetings/" },
          { label: "Alateen meetings", href: "https://al-anon.org/al-anon-meetings/find-an-alateen-meeting/" },
        ],
      },
      {
        name: "Nar-Anon & Narateen",
        about: "For families and friends of people who use drugs.",
        links: [
          { label: "In-person meetings", href: "https://www.nar-anon.org/find-a-meeting" },
          { label: "Virtual meetings", href: "https://nar-anon.org/virtual-meetings" },
        ],
      },
      {
        name: "Gam-Anon",
        about: "For families and friends of compulsive gamblers.",
        links: [{ label: "In-person & virtual meetings", href: "https://gam-anon.org/meeting-directory" }],
      },
      {
        name: "Adult Children of Alcoholics (ACA)",
        about: "For adults who grew up in alcoholic or otherwise dysfunctional families.",
        links: [{ label: "In-person & online meetings", href: "https://adultchildren.org/meeting-search/" }],
      },
      {
        name: "Co-Dependents Anonymous (CoDA)",
        about: "For anyone who wants healthy, loving relationships.",
        links: [
          { label: "US in-person meetings", href: "https://coda.org/find-a-meeting/" },
          { label: "Online meetings", href: "https://coda.org/find-a-meeting/online-meetings/" },
        ],
      },
    ],
  },
  {
    title: "Other addictions and compulsions (12-step)",
    programs: [
      {
        name: "Gamblers Anonymous (GA)",
        about: "For anyone who wants to stop gambling.",
        links: [
          { label: "Find a meeting", href: "https://gamblersanonymous.org/find-a-meeting/" },
          { label: "Virtual meetings", href: "https://gamblersanonymous.org/virtual-meetings/" },
        ],
      },
      {
        name: "Overeaters Anonymous (OA)",
        about: "Recovery from compulsive eating and food behaviors.",
        links: [{ label: "In-person, online & phone meetings", href: "https://oa.org/find-a-meeting/" }],
      },
      {
        name: "Nicotine Anonymous",
        about: "For anyone who wants a nicotine-free life.",
        links: [{ label: "In-person, online & phone meetings", href: "https://nicotine-anonymous.org/find-a-meeting/" }],
      },
      {
        name: "Sex and Love Addicts Anonymous (SLAA)",
        about: "Recovery from sex and love addiction.",
        links: [{ label: "In-person, online & phone meetings", href: "https://slaafws.org/meetings/" }],
      },
      {
        name: "Sex Addicts Anonymous (SAA)",
        about: "Recovery from addictive sexual behavior.",
        links: [{ label: "Meetings (see the Meetings tab)", href: "https://saa-recovery.org/" }],
      },
      {
        name: "Debtors Anonymous (DA)",
        about: "Recovery from compulsive debting.",
        links: [
          { label: "In-person meetings", href: "https://debtorsanonymous.org/meeting-search-f2f/" },
          { label: "Online & phone meetings", href: "https://debtorsanonymous.org/meeting-search-virtual/" },
        ],
      },
    ],
  },
];

export default function RecoveryPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-mint">Recovery meetings</h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/90">
        Movement and breath go hand in hand with a meeting. Here are the official meeting finders for the major
        recovery fellowships, both in person and online. Every one is free.
      </p>

      <section className="mt-8 rounded-2xl border border-sunset/50 bg-surface p-5">
        <h2 className="font-display text-xl text-sunset">Need help right now?</h2>
        <ul className="mt-3 space-y-2 text-foreground/90">
          <li>
            <strong>Emergency:</strong> call your local emergency number (911 in the US).
          </li>
          <li>
            <strong>988 Suicide &amp; Crisis Lifeline</strong> (US): call or text <strong>988</strong>, or{" "}
            <a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-flamingo">
              chat online
            </a>
            . En español: marca 988 y oprime 2, o textea AYUDA al 988.
          </li>
          <li>
            <strong>SAMHSA National Helpline</strong> (US): <strong>1-800-662-4357</strong>, free and confidential,
            24/7, in English and Spanish.{" "}
            <a href="https://findtreatment.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-flamingo">
              Find treatment near you
            </a>
            .
          </li>
        </ul>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="font-display text-2xl text-flamingo">{group.title}</h2>
          {group.intro && <p className="mt-2 text-foreground/80">{group.intro}</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {group.programs.map((p) => (
              <div key={p.name} className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                <p className="mt-1 text-sm text-foreground/70">{p.about}</p>
                <ul className="mt-3 space-y-1">
                  {p.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-mint underline-offset-2 hover:text-mint-bright hover:underline"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-12 text-sm text-foreground/60">
        Yoga Tropical isn&apos;t affiliated with, endorsed by, or speaking for any of these fellowships. We link
        to them because they help people. Links go to each program&apos;s official website and were last checked
        on {LAST_CHECKED}. Meeting times change often, so confirm details on the program&apos;s site. Found a
        broken link? Let us know.
      </p>
    </main>
  );
}
