-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "timeZone" TEXT;

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "reminderDaySentAt" TIMESTAMP(3),
ADD COLUMN     "reminderHourSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "reminderDaySentAt" TIMESTAMP(3),
ADD COLUMN     "reminderHourSentAt" TIMESTAMP(3);

