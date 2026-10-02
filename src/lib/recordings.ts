import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/pricing";
import { isVideoConfigured, listRecordings, deleteRecording } from "@/lib/video";

/**
 * Classes are recorded at Daily (see src/lib/video.ts) for quality review
 * and safety. Recordings stay at Daily only for `recordingRetentionDays`
 * (default 7) — this runs daily from the Vercel cron in vercel.json and
 * deletes anything older, except recordings of classes an admin has
 * flagged in an audit, which are held until the flag is dealt with.
 */
export async function purgeExpiredRecordings(now: Date = new Date()) {
  if (!isVideoConfigured()) return { deleted: 0, kept: 0 };
  const { recordingRetentionDays } = await getPlatformSettings();
  const cutoff = now.getTime() - recordingRetentionDays * 24 * 60 * 60 * 1000;

  const recordings = await listRecordings();
  const old = recordings.filter((r) => r.start_ts * 1000 < cutoff);
  const rooms = [...new Set(old.map((r) => r.room_name))];
  const classes = await prisma.classSession.findMany({
    where: { videoRoomSlug: { in: rooms } },
    select: { id: true, videoRoomSlug: true, audits: { where: { flagged: true }, select: { id: true } } },
  });
  const byRoom = new Map(classes.map((c) => [c.videoRoomSlug, c]));

  let deleted = 0;
  let kept = 0;
  for (const recording of old) {
    const session = byRoom.get(recording.room_name);
    if (session && session.audits.length > 0) {
      kept += 1;
      continue;
    }
    await deleteRecording(recording.id);
    deleted += 1;
    if (session) {
      await prisma.classSession.update({
        where: { id: session.id },
        data: { recordingStatus: "DELETED", recordingPath: null },
      });
    }
  }
  return { deleted, kept };
}
