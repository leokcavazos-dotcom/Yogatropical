import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/pricing";
import { unlink } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOADS_DIR ?? "./uploads");

/**
 * Every class is expected to be recorded (see the "Recordings & quality control"
 * section of the README) so admins can audit sessions after the fact. Recordings
 * are kept for `recordingRetentionDays` (default 7) unless a class has been
 * flagged, in which case an admin should extend `recordingExpiresAt` manually
 * before this purge job runs again.
 *
 * Actual capture requires wiring a recording backend for the video provider
 * (e.g. Jitsi + Jibri, or a hosted provider's recording API) — this module only
 * manages the lifecycle/retention of whatever recording file lands at
 * `recordingPath` once that capture pipeline is connected.
 */
export async function purgeExpiredRecordings(now: Date = new Date()) {
  const expired = await prisma.classSession.findMany({
    where: {
      recordingStatus: "AVAILABLE",
      recordingExpiresAt: { lte: now },
    },
  });

  let purged = 0;
  for (const session of expired) {
    if (session.recordingPath) {
      const resolved = path.resolve(UPLOADS_DIR, session.recordingPath);
      if (resolved.startsWith(UPLOADS_DIR)) {
        await unlink(resolved).catch(() => undefined);
      }
    }
    await prisma.classSession.update({
      where: { id: session.id },
      data: { recordingStatus: "DELETED", recordingPath: null },
    });
    purged += 1;
  }
  return purged;
}

export async function recordingRetentionMs(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.recordingRetentionDays * 24 * 60 * 60 * 1000;
}
