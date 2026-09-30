import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoRoomEmbedUrl } from "@/lib/video";
import JitsiRoom from "@/components/JitsiRoom";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-foreground/70">Please sign in to join this class.</p>
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
        <h1 className="font-display text-2xl text-foreground">This room isn&apos;t available to you</h1>
        <p className="mt-2 text-foreground/70">
          You&apos;ll see the video link here once your booking for this class has been accepted.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl text-foreground">{classSession.title}</h1>
      <p className="mb-4 text-sm text-foreground/60">
        {new Date(classSession.startTime).toLocaleString()} · {classSession.durationMinutes} min
      </p>

      {classSession.deliveryMethod === "IN_PERSON" ? (
        <div className="rounded-2xl border border-mint/30 bg-mint/5 p-6">
          <h2 className="font-display text-lg text-mint">This is an in-person session</h2>
          <p className="mt-2 text-foreground/80">
            <span className="font-medium">Location:</span> {classSession.locationAddress}
          </p>
          <p className="mt-3 text-sm text-foreground/60">
            There&apos;s no video room for this one — show up at the address above at the scheduled time.
          </p>
        </div>
      ) : (
        <JitsiRoom embedUrl={videoRoomEmbedUrl(classSession.videoRoomSlug!, session.user.name)} title={classSession.title} />
      )}

      <p className="mt-4 text-xs text-foreground/50">
        This session may be recorded for quality review and kept on file for a limited retention period. See our
        Code of Conduct for details.
      </p>
    </main>
  );
}
