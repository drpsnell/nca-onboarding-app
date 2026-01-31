-- AlterTable
ALTER TABLE "User" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "licenseState" TEXT;
ALTER TABLE "User" ADD COLUMN "licenseType" TEXT;

-- CreateTable
CREATE TABLE "CourseEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "objectivesMet" INTEGER NOT NULL,
    "contentRelevance" INTEGER NOT NULL,
    "contentEvidence" INTEGER NOT NULL,
    "materialQuality" INTEGER NOT NULL,
    "timeAppropriate" INTEGER NOT NULL,
    "wouldRecommend" INTEGER NOT NULL,
    "mostValuable" TEXT,
    "leastValuable" TEXT,
    "suggestedImprovements" TEXT,
    "objectiveRatings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseEvaluation_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseEvaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CaseAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CECompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "creditHours" REAL NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT NOT NULL,
    "userLicense" TEXT,
    "courseTitle" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "caseVersion" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    CONSTRAINT "CECompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CECompletion_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CECompletion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CaseAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER,
    "rubricVersion" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "durationSec" INTEGER,
    "notes" TEXT,
    "detailJson" JSONB,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "questionResponses" JSONB,
    "selfAssessmentRatings" JSONB,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "ceEligible" BOOLEAN NOT NULL DEFAULT false,
    "disclaimerAcceptedAt" DATETIME,
    CONSTRAINT "CaseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseAttempt_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CaseAttempt" ("caseStudyId", "completedAt", "detailJson", "durationSec", "id", "notes", "rubricVersion", "score", "startedAt", "userId") SELECT "caseStudyId", "completedAt", "detailJson", "durationSec", "id", "notes", "rubricVersion", "score", "startedAt", "userId" FROM "CaseAttempt";
DROP TABLE "CaseAttempt";
ALTER TABLE "new_CaseAttempt" RENAME TO "CaseAttempt";
CREATE INDEX "CaseAttempt_userId_idx" ON "CaseAttempt"("userId");
CREATE INDEX "CaseAttempt_caseStudyId_idx" ON "CaseAttempt"("caseStudyId");
CREATE INDEX "CaseAttempt_completedAt_idx" ON "CaseAttempt"("completedAt");
CREATE TABLE "new_CaseStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "contentUrl" TEXT,
    "complexity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creditHours" REAL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "approvalDate" DATETIME,
    "expirationDate" DATETIME
);
INSERT INTO "new_CaseStudy" ("active", "complexity", "contentUrl", "id", "synopsis", "title") SELECT "active", "complexity", "contentUrl", "id", "synopsis", "title" FROM "CaseStudy";
DROP TABLE "CaseStudy";
ALTER TABLE "new_CaseStudy" RENAME TO "CaseStudy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CourseEvaluation_attemptId_key" ON "CourseEvaluation"("attemptId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_userId_idx" ON "CourseEvaluation"("userId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_caseStudyId_idx" ON "CourseEvaluation"("caseStudyId");

-- CreateIndex
CREATE UNIQUE INDEX "CECompletion_attemptId_key" ON "CECompletion"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "CECompletion_certificateNumber_key" ON "CECompletion"("certificateNumber");

-- CreateIndex
CREATE INDEX "CECompletion_userId_idx" ON "CECompletion"("userId");

-- CreateIndex
CREATE INDEX "CECompletion_caseStudyId_idx" ON "CECompletion"("caseStudyId");

-- CreateIndex
CREATE INDEX "CECompletion_completedAt_idx" ON "CECompletion"("completedAt");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");
