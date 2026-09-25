-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'PAYMENT_FAILED';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "InstructorProfile" ADD COLUMN     "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_stripeAccountId_key" ON "InstructorProfile"("stripeAccountId");

