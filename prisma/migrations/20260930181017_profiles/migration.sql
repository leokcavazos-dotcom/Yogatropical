-- CreateEnum
CREATE TYPE "CertificationKind" AS ENUM ('TEACHING', 'CPR', 'INSURANCE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoPath" TEXT;

-- AlterTable
ALTER TABLE "InstructorProfile" ADD COLUMN     "ageGroups" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maxStudents" INTEGER,
ADD COLUMN     "specialPopulations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "whyITeach" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "kind" "CertificationKind" NOT NULL DEFAULT 'TEACHING';

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aboutMe" TEXT NOT NULL DEFAULT '',
    "whatBringsYou" TEXT NOT NULL DEFAULT '',
    "ageRange" TEXT,
    "notesForInstructors" TEXT NOT NULL DEFAULT '',
    "prefersVirtual" BOOLEAN NOT NULL DEFAULT true,
    "prefersInPerson" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClientLanguages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "_ClientLanguages_B_index" ON "_ClientLanguages"("B");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientLanguages" ADD CONSTRAINT "_ClientLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientLanguages" ADD CONSTRAINT "_ClientLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

