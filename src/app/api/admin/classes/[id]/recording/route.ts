import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isVideoConfigured, listRecordings, recordingAccessLink } from "@/lib/video";

// Sends an admin to a short-lived link for a class's most recent recording.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const { id } = await params;
  const classSession = await prisma.classSession.findUnique({ where: { id }, select: { videoRoomSlug: true } });
  if (!classSession?.videoRoomSlug || !isVideoConfigured()) {
    return NextResponse.json({ error: "No recording for this class." }, { status: 404 });
  }
  const recordings = (await listRecordings(classSession.videoRoomSlug)).sort((a, b) => b.start_ts - a.start_ts);
  const latest = recordings[0];
  const link = latest ? await recordingAccessLink(latest.id) : null;
  if (!link) {
    return NextResponse.json(
      { error: "No recording found — it may still be processing, or it was deleted after the retention period." },
      { status: 404 },
    );
  }
  return NextResponse.redirect(link);
}
