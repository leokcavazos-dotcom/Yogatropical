import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOADS_DIR ?? "./uploads");
const CERTIFICATIONS_SUBDIR = "certifications";

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Certificates live in Vercel Blob storage in production (the local
 * filesystem doesn't survive between requests on Vercel). Falls back to
 * local disk when BLOB_READ_WRITE_TOKEN isn't set, so local dev doesn't
 * need a Blob store connected. Either way, `storagePath` is opaque to
 * callers — a blob URL or a relative disk path — and access control stays
 * enforced by the /api/certifications/[id]/file route, not by the storage
 * layer: blob uploads are unguessable by URL but never served to clients
 * directly.
 */
export async function saveCertificationFile(instructorProfileId: string, fileName: string, data: Buffer) {
  const safeExt = path.extname(fileName).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const storedName = `${randomUUID()}${safeExt}`;

  if (blobConfigured()) {
    const blob = await put(`${CERTIFICATIONS_SUBDIR}/${instructorProfileId}/${storedName}`, data, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const dir = path.join(UPLOADS_DIR, CERTIFICATIONS_SUBDIR, instructorProfileId);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(CERTIFICATIONS_SUBDIR, instructorProfileId, storedName);
  await writeFile(path.join(UPLOADS_DIR, storagePath), data);
  return storagePath;
}

export async function readCertificationFile(storagePath: string): Promise<Buffer> {
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    const response = await fetch(storagePath);
    if (!response.ok) throw new Error("Failed to fetch certification file from blob storage");
    return Buffer.from(await response.arrayBuffer());
  }

  const resolved = path.resolve(/* turbopackIgnore: true */ UPLOADS_DIR, storagePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid storage path");
  }
  return readFile(resolved);
}
