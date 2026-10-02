import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinClassRoom, generateVideoRoomSlug, type VideoJoin } from "@/lib/video";
import VideoRoom from "@/components/VideoRoom";
import LocalTime from "@/components/LocalTime";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";

export default async function RoomPage({ params }: PageProps<"/room/[id]">) {
  const { id } = await params;
  const [session, { t }] = await Promise.all([auth(), getI18n()]);
  const r = t.room;
  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-foreground/70">{r.signIn}</p>
        <Link href="/login" className="mt-4 inline-block underline hover:text-flamingo">
          {t.nav.signIn}
        </Link>
      </main>
    );
  }

  const classSession = await prisma.classSession.findUnique({
    where: { id },
    include: { enrollments: true },
  });
  if (!classSession) notFound();

  const isInstructor = classSession.instructorId === session.user.id;
  const isAcceptedStudent = classSession.enrollments.some(
    (e) => e.clientId === session.user.id && e.status === "ACCEPTED",
  );

  if (!isInstructor && !isAcceptedStudent) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-foreground">{r.notAvailableTitle}</h1>
        <p className="mt-2 text-foreground/70">{r.notAvailableBody}</p>
      </main>
    );
  }

  let join: VideoJoin | null = null;
  if (classSession.deliveryMethod === "VIRTUAL") {
    let slug = classSession.videoRoomSlug;
    if (!slug) {
      slug = generateVideoRoomSlug();
      await prisma.classSession.update({ where: { id }, data: { videoRoomSlug: slug } });
    }
    join = await joinClassRoom({
      slug,
      startTime: classSession.startTime,
      durationMinutes: classSession.durationMinutes,
      userName: session.user.name,
      isInstructor,
    }).catch((error) => {
      console.error("Couldn't open video room", error);
      return null;
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl text-foreground">{classSession.title}</h1>
      <p className="mb-4 text-sm text-foreground/60">
        <LocalTime iso={classSession.startTime.toISOString()} /> · {fmt(t.common.minutes, { n: classSession.durationMinutes })}
      </p>

      {classSession.deliveryMethod === "IN_PERSON" ? (
        <div className="rounded-2xl border border-mint/30 bg-mint/5 p-6">
          <h2 className="font-display text-lg text-mint">{r.inPersonTitle}</h2>
          <p className="mt-2 text-foreground/80">
            <span className="font-medium">{r.location}</span> {classSession.locationAddress}
          </p>
          <p className="mt-3 text-sm text-foreground/60">{r.inPersonBody}</p>
        </div>
      ) : join ? (
        <VideoRoom join={join} title={classSession.title} t={r} />
      ) : (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-red-200">{r.unavailable}</p>
      )}
    </main>
  );
}
