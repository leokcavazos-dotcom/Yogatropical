-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "isAvailableOnDemand" BOOLEAN NOT NULL DEFAULT false,
    "onDemandDurationMinutes" INTEGER,
    "onDemandCapacity" INTEGER,
    "onDemandPricePerStudent" REAL,
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorProfileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNotes" TEXT NOT NULL DEFAULT '',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    CONSTRAINT "Certification_instructorProfileId_fkey" FOREIGN KEY ("instructorProfileId") REFERENCES "InstructorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "capacity" INTEGER,
    "pricePerStudent" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "videoRoomSlug" TEXT NOT NULL,
    "recordingStatus" TEXT NOT NULL DEFAULT 'NOT_RECORDED',
    "recordingPath" TEXT,
    "recordingExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassSession_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classSessionId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassAudit_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassAudit_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classSessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priceCharged" REAL NOT NULL,
    "commissionAmount" REAL NOT NULL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "Enrollment_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceFloor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "durationMinutes" INTEGER NOT NULL,
    "minPricePerStudent" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "commissionPercent" REAL NOT NULL DEFAULT 10,
    "maxMarkupPercent" REAL NOT NULL DEFAULT 25,
    "recordingRetentionDays" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_InstructorSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InstructorSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "InstructorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InstructorSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_InstructorLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InstructorLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "InstructorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InstructorLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ClassSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ClassSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClassSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ClassLanguages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ClassLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClassLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_userId_key" ON "InstructorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_videoRoomSlug_key" ON "ClassSession"("videoRoomSlug");

-- CreateIndex
CREATE INDEX "ClassSession_startTime_idx" ON "ClassSession"("startTime");

-- CreateIndex
CREATE INDEX "ClassSession_mode_status_idx" ON "ClassSession"("mode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classSessionId_clientId_key" ON "Enrollment"("classSessionId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceFloor_durationMinutes_key" ON "PriceFloor"("durationMinutes");

-- CreateIndex
CREATE UNIQUE INDEX "_InstructorSpecialties_AB_unique" ON "_InstructorSpecialties"("A", "B");

-- CreateIndex
CREATE INDEX "_InstructorSpecialties_B_index" ON "_InstructorSpecialties"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InstructorLanguages_AB_unique" ON "_InstructorLanguages"("A", "B");

-- CreateIndex
CREATE INDEX "_InstructorLanguages_B_index" ON "_InstructorLanguages"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassSpecialties_AB_unique" ON "_ClassSpecialties"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassSpecialties_B_index" ON "_ClassSpecialties"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassLanguages_AB_unique" ON "_ClassLanguages"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassLanguages_B_index" ON "_ClassLanguages"("B");
