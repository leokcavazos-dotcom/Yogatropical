import { randomBytes } from "crypto";

/**
 * Live video runs on Daily (daily.co): private rooms that only people we
 * hand a meeting token to can enter, with cloud recording for quality
 * review. Without DAILY_API_KEY (local dev) rooms fall back to the public
 * meet.jit.si server, which cuts embedded calls off after 5 minutes — fine
 * for trying things out, not for real classes.
 */
const DAILY_API_BASE = process.env.DAILY_API_BASE ?? "https://api.daily.co/v1";
const JITSI_DOMAIN = "meet.jit.si";

export function isVideoConfigured(): boolean {
  return Boolean(process.env.DAILY_API_KEY);
}

/** Room names are long and random rather than derived from the class id. */
export function generateVideoRoomSlug(): string {
  return `yogatropical-${randomBytes(12).toString("hex")}`;
}

export class VideoError extends Error {}

async function daily<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${DAILY_API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok && res.status !== 404) {
    const info = (data as { info?: string; error?: string }) ?? {};
    throw new VideoError(`Video service error (${res.status}): ${info.info ?? info.error ?? "unknown"}`);
  }
  return { status: res.status, data };
}

interface DailyRoom {
  name: string;
  url: string;
}

const toUnix = (date: Date) => Math.floor(date.getTime() / 1000);

/** Finds the class's private room, creating it the first time someone joins. */
async function getOrCreateRoom(name: string, opts: { expiresAt: Date; record: boolean }): Promise<DailyRoom> {
  const existing = await daily<DailyRoom>("GET", `/rooms/${encodeURIComponent(name)}`);
  if (existing.status === 200) return existing.data;
  const created = await daily<DailyRoom>("POST", "/rooms", {
    name,
    privacy: "private",
    properties: {
      exp: toUnix(opts.expiresAt),
      eject_at_room_exp: true,
      enable_prejoin_ui: true,
      ...(opts.record ? { enable_recording: "cloud" } : {}),
    },
  });
  return created.data;
}

async function meetingToken(room: string, userName: string, opts: { owner: boolean; record: boolean; expiresAt: Date }) {
  const { data } = await daily<{ token: string }>("POST", "/meeting-tokens", {
    properties: {
      room_name: room,
      user_name: userName,
      is_owner: opts.owner,
      exp: toUnix(opts.expiresAt),
      // The instructor's arrival starts the recording, so every class is captured without anyone remembering to.
      ...(opts.record ? { enable_recording: "cloud", start_cloud_recording: true } : {}),
    },
  });
  return data.token;
}

export interface VideoJoin {
  url: string;
  provider: "daily" | "jitsi-test";
  recorded: boolean;
}

function jitsiFallback(slug: string, userName: string): VideoJoin {
  const params = new URLSearchParams({ "config.prejoinPageEnabled": "true", "userInfo.displayName": userName });
  return { url: `https://${JITSI_DOMAIN}/${slug}#${params.toString()}`, provider: "jitsi-test", recorded: false };
}

/** The embed URL for one person joining a class. */
export async function joinClassRoom(input: {
  slug: string;
  startTime: Date;
  durationMinutes: number;
  userName: string;
  isInstructor: boolean;
}): Promise<VideoJoin> {
  if (!isVideoConfigured()) return jitsiFallback(input.slug, input.userName);
  const end = new Date(input.startTime.getTime() + input.durationMinutes * 60_000);
  const expiresAt = new Date(Math.max(end.getTime(), Date.now()) + 60 * 60_000); // an hour of slack after class
  const room = await getOrCreateRoom(input.slug, { expiresAt, record: true });
  const token = await meetingToken(room.name, input.userName, {
    owner: input.isInstructor,
    record: input.isInstructor,
    expiresAt,
  });
  return { url: `${room.url}?t=${token}`, provider: "daily", recorded: true };
}

/** A short-lived, never-recorded room for checking camera and microphone. */
export async function joinTestRoom(userName: string): Promise<VideoJoin> {
  const slug = `yt-test-${randomBytes(8).toString("hex")}`;
  if (!isVideoConfigured()) return jitsiFallback(slug, userName);
  const expiresAt = new Date(Date.now() + 30 * 60_000);
  const room = await getOrCreateRoom(slug, { expiresAt, record: false });
  const token = await meetingToken(room.name, userName, { owner: true, record: false, expiresAt });
  return { url: `${room.url}?t=${token}`, provider: "daily", recorded: false };
}

interface DailyRecording {
  id: string;
  room_name: string;
  start_ts: number;
  status: string;
}

/** Every cloud recording on the account (Daily pages them 100 at a time). */
export async function listRecordings(roomName?: string): Promise<DailyRecording[]> {
  const all: DailyRecording[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({ limit: "100" });
    if (roomName) params.set("room_name", roomName);
    if (startingAfter) params.set("starting_after", startingAfter);
    const { data } = await daily<{ data?: DailyRecording[] }>("GET", `/recordings?${params}`);
    const batch = data.data ?? [];
    all.push(...batch);
    if (batch.length < 100) break;
    startingAfter = batch[batch.length - 1].id;
  }
  return all;
}

export async function deleteRecording(id: string) {
  await daily("DELETE", `/recordings/${encodeURIComponent(id)}`);
}

/** A temporary link to watch or download a recording. */
export async function recordingAccessLink(id: string): Promise<string | null> {
  const { status, data } = await daily<{ download_link?: string }>("GET", `/recordings/${encodeURIComponent(id)}/access-link`);
  return status === 200 ? data.download_link ?? null : null;
}
