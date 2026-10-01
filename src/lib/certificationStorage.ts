import { saveUploadedFile, readUploadedFile } from "@/lib/fileStorage";

const CERTIFICATIONS_SUBDIR = "certifications";

// Certificates are only ever served through /api/certifications/[id]/file,
// which enforces who may see them (see fileStorage.ts).
export async function saveCertificationFile(instructorProfileId: string, fileName: string, data: Buffer) {
  return saveUploadedFile(CERTIFICATIONS_SUBDIR, instructorProfileId, fileName, data);
}

export async function readCertificationFile(storagePath: string): Promise<Buffer> {
  return readUploadedFile(storagePath);
}
