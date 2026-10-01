import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOADS_DIR ?? "./uploads");

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Uploaded files live in Vercel Blob storage in production (the local
 * filesystem doesn't survive between requests on Vercel). Falls back to
 * local disk when BLOB_READ_WRITE_TOKEN isn't set, so local dev doesn't
 * need a Blob store connected. Either way, the returned storage path is
 * opaque to callers — a blob URL or a relative disk path — and access
 * control stays enforced by the API routes that serve files, not by the
 * storage layer: blob uploads are unguessable by URL but never served to
 * clients directly.
 */
export async function saveUploadedFile(subdir: string, ownerId: string, fileName: string, data: Buffer) {
  const safeExt = path.extname(fileName).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const storedName = `${randomUUID()}${safeExt}`;

  if (blobConfigured()) {
    const blob = await put(`${subdir}/${ownerId}/${storedName}`, data, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const dir = path.join(UPLOADS_DIR, subdir, ownerId);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(subdir, ownerId, storedName);
  await writeFile(path.join(UPLOADS_DIR, storagePath), data);
  return storagePath;
}

export async function readUploadedFile(storagePath: string): Promise<Buffer> {
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    const response = await fetch(storagePath);
    if (!response.ok) throw new Error("Failed to fetch file from blob storage");
    return Buffer.from(await response.arrayBuffer());
  }

  const resolved = path.resolve(/* turbopackIgnore: true */ UPLOADS_DIR, storagePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid storage path");
  }
  return readFile(resolved);
}

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Content type to serve a stored file with, from its extension; unknown types download instead of rendering. */
export function contentTypeFor(fileName: string): string {
  return CONTENT_TYPES[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
}

/** Checks a file's first bytes, so a file can't claim to be an image or PDF when it isn't. */
export function detectFileType(data: Buffer): "png" | "jpg" | "webp" | "pdf" | null {
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpg";
  if (data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (data.length >= 5 && data.toString("ascii", 0, 5) === "%PDF-") return "pdf";
  return null;
}

/** Reads an uploaded image, checking its size and real type. */
export async function readImageUpload(
  file: FormDataEntryValue | null | undefined,
  maxBytes: number,
): Promise<{ buffer: Buffer; ext: "jpg" | "png" | "webp" } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) return { error: "Attach an image (JPG, PNG, or WebP)." };
  if (file.size > maxBytes) return { error: `Image is too large (${Math.round(maxBytes / 1024 / 1024)}MB max).` };
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(buffer);
  if (type !== "jpg" && type !== "png" && type !== "webp") {
    return { error: "Images must be a JPG, PNG, or WebP file." };
  }
  return { buffer, ext: type };
}

/** Serves a stored image with a safe content type. */
export async function imageResponse(storagePath: string, cacheControl: string) {
  const bytes = await readUploadedFile(storagePath);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentTypeFor(storagePath),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": cacheControl,
    },
  });
}
