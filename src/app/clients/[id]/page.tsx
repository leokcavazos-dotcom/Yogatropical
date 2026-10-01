import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { findCountry } from "@/lib/countries";
import { canViewClientProfile } from "@/lib/profileAccess";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Client profile — Yoga Tropical", robots: { index: false } };

export default async function ClientProfilePage({ params }: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const session = await auth();
  // Same response whether the client doesn't exist or the viewer lacks access, so profiles can't be probed.
  if (!(await canViewClientProfile(session?.user, id))) notFound();

  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      preferredLanguage: { select: { name: true } },
      clientProfile: { include: { languages: { select: { name: true } } } },
    },
  });
  if (!client) notFound();
  const p = client.clientProfile;

  const languages = p?.languages.map((l) => l.name) ?? [];
  if (languages.length === 0 && client.preferredLanguage) languages.push(client.preferredLanguage.name);
  const prefers = [p?.prefersVirtual && "Virtual", p?.prefersInPerson && "In person"].filter(Boolean).join(" & ");
  const where = [p?.area, findCountry(p?.country)?.name].filter(Boolean).join(", ");

  const rows: [string, string | null | undefined][] = [
    ["Age range", p?.ageRange],
    ["Languages", languages.join(", ")],
    ["Prefers", prefers],
    ["Location", where],
  ];
  const sections: [string, string | undefined][] = [
    ["What brings them here", p?.whatBringsYou],
    ["About them", p?.aboutMe],
    ["Notes for instructors", p?.notesForInstructors],
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center gap-5">
        <Avatar userId={client.id} name={client.name} size="lg" />
        <div>
          <h1 className="font-display text-3xl text-mint">{client.name}</h1>
          <p className="mt-1 text-xs text-foreground/60">
            Private profile — shared only with instructors this person has booked. Please keep it confidential.
          </p>
        </div>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-foreground/60">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          ))}
      </dl>

      {sections
        .filter(([, text]) => text)
        .map(([title, text]) => (
          <section key={title} className="mt-8">
            <h2 className="font-display text-xl text-flamingo">{title}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">{text}</p>
          </section>
        ))}

      {!p && <p className="mt-8 text-sm text-foreground/60">This client hasn&apos;t filled out a profile yet.</p>}
    </main>
  );
}
