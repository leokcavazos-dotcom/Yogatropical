-- AlterTable
ALTER TABLE "InstructorProfile" ADD COLUMN "payoutEmail" TEXT;

-- CreateTable
CREATE TABLE "SafetyAcknowledgment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "signedName" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafetyAcknowledgment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "guidelinesAcceptedAt" DATETIME,
    "onboardingCompletedAt" DATETIME,
    "phone" TEXT,
    "preferredLanguageId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "guidelinesAcceptedAt", "id", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "guidelinesAcceptedAt", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SafetyAcknowledgment_userId_version_key" ON "SafetyAcknowledgment"("userId", "version");
