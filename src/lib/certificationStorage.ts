import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOADS_DIR ?? "./uploads");
const CERTIFICATIONS_SUBDIR = "certifications";

export async function saveCertificationFile(instructorProfileId: string, fileName: string, data: Buffer) {
  const dir = path.join(UPLOADS_DIR, CERTIFICATIONS_SUBDIR, instructorProfileId);
  await mkdir(dir, { recursive: true });
  const safeExt = path.extname(fileName).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const storedName = `${randomUUID()}${safeExt}`;
  const storagePath = path.join(CERTIFICATIONS_SUBDIR, instructorProfileId, storedName);
  await writeFile(path.join(UPLOADS_DIR, storagePath), data);
  return storagePath;
}

export async function readCertificationFile(storagePath: string): Promise<Buffer> {
  const resolved = path.resolve(/* turbopackIgnore: true */ UPLOADS_DIR, storagePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid storage path");
  }
  return readFile(resolved);
}
