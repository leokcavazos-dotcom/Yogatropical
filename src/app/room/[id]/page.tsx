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
        <p className="text-stone-600">Please sign in to join this class.</p>
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
        <h1 className="font-serif text-2xl text-stone-800">This room isn&apos;t available to you</h1>
        <p className="mt-2 text-stone-600">
          You&apos;ll see the video link here once your booking for this class has been accepted.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-2xl text-stone-800">{classSession.title}</h1>
      <p className="mb-4 text-sm text-stone-500">
        {new Date(classSession.startTime).toLocaleString()} · {classSession.durationMinutes} min
      </p>

      {classSession.deliveryMethod === "IN_PERSON" ? (
        <div className="rounded-2xl border border-palm/30 bg-palm/5 p-6">
          <h2 className="font-serif text-lg text-palm-dark">This is an in-person session</h2>
          <p className="mt-2 text-stone-700">
            <span className="font-medium">Location:</span> {classSession.locationAddress}
          </p>
          <p className="mt-3 text-sm text-stone-500">
            There&apos;s no video room for this one — show up at the address above at the scheduled time.
          </p>
        </div>
      ) : (
        <JitsiRoom embedUrl={videoRoomEmbedUrl(classSession.videoRoomSlug!, session.user.name)} title={classSession.title} />
      )}

      <p className="mt-4 text-xs text-stone-400">
        This session may be recorded for quality review and kept on file for a limited retention period. See our
        Code of Conduct for details.
      </p>
    </main>
  );
}
