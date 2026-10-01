import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { findCountry } from "@/lib/countries";
import { CERTIFICATION_KINDS } from "@/lib/profileOptions";
import Avatar from "@/components/Avatar";
import LocalTime from "@/components/LocalTime";

async function loadInstructor(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "INSTRUCTOR" },
    select: {
      id: true,
      name: true,
      instructorProfile: {
        select: {
          bio: true,
          whyITeach: true,
          ageGroups: true,
          specialPopulations: true,
          maxStudents: true,
          isCertified: true,
          isAvailableOnDemand: true,
          offersInPerson: true,
          travelServiceArea: true,
          country: true,
          specialties: { select: { id: true, name: true } },
          languages: { select: { id: true, name: true } },
          certifications: {
            where: { status: "APPROVED" },
            select: { id: true, kind: true, fileName: true },
            orderBy: { reviewedAt: "desc" },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps<"/instructors/[id]">): Promise<Metadata> {
  const { id } = await params;
  const instructor = await loadInstructor(id);
  return { title: instructor ? `${instructor.name} — Yoga Tropical` : "Instructor — Yoga Tropical" };
}

function Chips({ items, tone }: { items: string[]; tone: "flamingo" | "mint" }) {
  const style = tone === "flamingo" ? "border-flamingo/50 text-flamingo" : "border-mint/50 text-mint";
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full border px-3 py-1 text-sm ${style}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function InstructorProfilePage({ params }: PageProps<"/instructors/[id]">) {
  const { id } = await params;
  const [instructor, session] = await Promise.all([loadInstructor(id), auth()]);
  const profile = instructor?.instructorProfile;
  if (!instructor || !profile) notFound();

  // Profiles go public once a teaching certificate is approved; before that,
  // only the instructor (previewing) and admins can see them.
  const isOwnerOrAdmin = session?.user.id === instructor.id || session?.user.role === "ADMIN";
  if (!profile.isCertified && !isOwnerOrAdmin) notFound();

  const approvedKinds = new Set(profile.certifications.map((c) => c.kind));
  const viewableDocs = profile.certifications.filter((c) => c.kind !== "INSURANCE");
  const badges = [
    profile.isCertified && "✓ Verified certificate",
    approvedKinds.has("CPR") && "✓ CPR / First aid",
    approvedKinds.has("INSURANCE") && "✓ Insured",
  ].filter(Boolean) as string[];
  const inPersonWhere = [profile.travelServiceArea, findCountry(profile.country)?.name].filter(Boolean).join(", ");

  const upcoming = await prisma.classSession.findMany({
    where: { instructorId: instructor.id, mode: "SCHEDULED", status: "OPEN", startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    take: 5,
    select: { id: true, title: true, startTime: true, durationMinutes: true, pricePerStudent: true, deliveryMethod: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {!profile.isCertified && (
        <p className="mb-6 rounded-lg bg-sunset/15 px-4 py-2 text-sm text-sunset">
          Preview — this profile goes public once a teaching certificate is approved.
        </p>
      )}

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar userId={instructor.id} name={instructor.name} size="lg" />
        <div>
          <h1 className="font-display text-4xl text-mint">{instructor.name}</h1>
          {badges.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {badges.map((b) => (
                <span key={b} className="rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint">
                  {b}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm text-foreground/70">
            Teaches: Virtual{profile.offersInPerson && inPersonWhere ? ` · In person in ${inPersonWhere}` : ""}
            {profile.maxStudents ? ` · Up to ${profile.maxStudents} students per class` : ""}
          </p>
        </div>
      </div>

      {profile.specialties.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-flamingo">Specialties</h2>
          <Chips items={profile.specialties.map((s) => s.name)} tone="flamingo" />
        </section>
      )}
      {profile.languages.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-flamingo">Languages</h2>
          <Chips items={profile.languages.map((l) => l.name)} tone="mint" />
        </section>
      )}
      {(profile.ageGroups.length > 0 || profile.specialPopulations.length > 0) && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-flamingo">Who I work with</h2>
          {profile.ageGroups.length > 0 && <Chips items={profile.ageGroups} tone="mint" />}
          {profile.specialPopulations.length > 0 && <Chips items={profile.specialPopulations} tone="flamingo" />}
        </section>
      )}
      {profile.whyITeach && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-flamingo">Why I share my practice</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">{profile.whyITeach}</p>
        </section>
      )}
      {profile.bio && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-flamingo">About me</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">{profile.bio}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-flamingo">Certificates</h2>
        {viewableDocs.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">No approved certificates yet.</p>
        ) : session ? (
          <ul className="mt-2 space-y-2">
            {viewableDocs.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <span>{CERTIFICATION_KINDS[c.kind]}</span>
                <a href={`/api/certifications/${c.id}/file`} target="_blank" rel="noreferrer" className="text-mint underline hover:text-mint-bright">
                  View
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-foreground/70">
            {viewableDocs.length} verified document{viewableDocs.length === 1 ? "" : "s"}.{" "}
            <Link href="/login" className="underline hover:text-flamingo">
              Sign in
            </Link>{" "}
            to view them.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl text-flamingo">Upcoming classes</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            No scheduled classes right now.
            {profile.isAvailableOnDemand || profile.offersInPerson ? " You can still book them from the Browse page." : ""}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {upcoming.map((c) => (
              <li key={c.id} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <span className="font-semibold">{c.title}</span> · <LocalTime iso={c.startTime.toISOString()} /> ·{" "}
                {c.durationMinutes} min · {c.deliveryMethod === "IN_PERSON" ? "In person" : "Virtual"} · ${c.pricePerStudent.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <Link href="/browse" className="mt-4 inline-block rounded-full bg-flamingo px-5 py-2 text-sm font-semibold text-ink hover:bg-flamingo-bright">
          Browse & book classes
        </Link>
      </section>
    </main>
  );
}
