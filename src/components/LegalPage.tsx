import { LEGAL } from "@/lib/legal";

// A paragraph is a string; a nested string array renders as a bulleted list.
export type LegalBlock = string | string[];

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

interface LegalPageProps {
  title: string;
  intro: string[];
  sections: LegalSection[];
}

export default function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-mint">{title}</h1>
      <p className="mt-2 text-sm text-foreground/60">Last updated: {LEGAL.effectiveDate}</p>
      {intro.map((paragraph) => (
        <p key={paragraph} className="mt-4 leading-relaxed text-foreground/90">
          {paragraph}
        </p>
      ))}
      <ol className="mt-6 list-decimal space-y-1 pl-6 text-sm text-foreground/70">
        {sections.map((section, i) => (
          <li key={section.heading}>
            <a href={`#section-${i + 1}`} className="underline hover:text-flamingo">
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
      {sections.map((section, i) => (
        <section key={section.heading} id={`section-${i + 1}`} className="mt-10 scroll-mt-24">
          <h2 className="font-display text-2xl text-flamingo">
            {i + 1}. {section.heading}
          </h2>
          {section.blocks.map((block, j) =>
            typeof block === "string" ? (
              <p key={j} className="mt-3 leading-relaxed text-foreground/90">
                {block}
              </p>
            ) : (
              <ul key={j} className="mt-3 list-disc space-y-2 pl-6 text-foreground/90">
                {block.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}
    </main>
  );
}
