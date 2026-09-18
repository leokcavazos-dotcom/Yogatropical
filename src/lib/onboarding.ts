import { prisma } from "@/lib/prisma";
import { WAIVER_VERSION } from "@/lib/waiver";

export async function hasSignedCurrentWaiver(userId: string): Promise<boolean> {
  const record = await prisma.safetyAcknowledgment.findUnique({
    where: { userId_version: { userId, version: WAIVER_VERSION } },
  });
  return Boolean(record);
}
