import { prisma } from "@/lib/prisma";

interface Viewer {
  id: string;
  role: string;
}

/**
 * Client profiles (and client photos) are private: only the client, admins,
 * and instructors the client has requested or booked may see them.
 */
export async function canViewClientProfile(viewer: Viewer | null | undefined, clientId: string): Promise<boolean> {
  if (!viewer) return false;
  if (viewer.id === clientId || viewer.role === "ADMIN") return true;
  if (viewer.role !== "INSTRUCTOR") return false;
  const enrollment = await prisma.enrollment.findFirst({
    where: { clientId, classSession: { instructorId: viewer.id } },
    select: { id: true },
  });
  return Boolean(enrollment);
}

export async function hasProfilePhoto(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { photoPath: true } });
  return Boolean(user?.photoPath);
}

export async function hasApprovedInsurance(instructorProfileId: string): Promise<boolean> {
  const insurance = await prisma.certification.findFirst({
    where: { instructorProfileId, kind: "INSURANCE", status: "APPROVED" },
    select: { id: true },
  });
  return Boolean(insurance);
}

export const PHOTO_REQUIRED_MESSAGE =
  "Add a profile photo first (in the Profile section) — clients like to see who they're booking.";
export const INSURANCE_REQUIRED_MESSAGE =
  "In-person teaching needs approved proof of liability insurance. Upload it under Certificates & documents.";
