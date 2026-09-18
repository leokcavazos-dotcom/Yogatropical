import { randomBytes } from "crypto";

const JITSI_DOMAIN = "meet.jit.si";

/**
 * Jitsi's public server treats any unguessed room name as private-by-obscurity,
 * so slugs are long and random rather than derived from the class id.
 */
export function generateVideoRoomSlug(): string {
  return `yogatropical-${randomBytes(12).toString("hex")}`;
}

export function videoRoomUrl(slug: string): string {
  return `https://${JITSI_DOMAIN}/${slug}`;
}

export function videoRoomEmbedUrl(slug: string, displayName?: string): string {
  const params = new URLSearchParams({
    "config.prejoinPageEnabled": "false",
  });
  if (displayName) params.set("userInfo.displayName", displayName);
  return `https://${JITSI_DOMAIN}/${slug}#${params.toString()}`;
}
