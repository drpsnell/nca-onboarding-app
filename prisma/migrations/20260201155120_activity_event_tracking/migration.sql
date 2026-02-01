-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "phase" TEXT,
    "metadata" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CaseAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "phaseTimings" JSONB,
    "idleSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastHeartbeatAt" DATETIME,
    CONSTRAINT "CaseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseAttempt_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CaseAttempt" ("activeSeconds", "attemptNumber", "caseStudyId", "ceEligible", "completedAt", "detailJson", "disclaimerAcceptedAt", "durationSec", "id", "notes", "questionResponses", "questionsAnswered", "rubricVersion", "score", "selfAssessmentRatings", "startedAt", "status", "userId") SELECT "activeSeconds", "attemptNumber", "caseStudyId", "ceEligible", "completedAt", "detailJson", "disclaimerAcceptedAt", "durationSec", "id", "notes", "questionResponses", "questionsAnswered", "rubricVersion", "score", "selfAssessmentRatings", "startedAt", "status", "userId" FROM "CaseAttempt";
DROP TABLE "CaseAttempt";
ALTER TABLE "new_CaseAttempt" RENAME TO "CaseAttempt";
CREATE INDEX "CaseAttempt_userId_idx" ON "CaseAttempt"("userId");
CREATE INDEX "CaseAttempt_caseStudyId_idx" ON "CaseAttempt"("caseStudyId");
CREATE INDEX "CaseAttempt_completedAt_idx" ON "CaseAttempt"("completedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ActivityEvent_attemptId_idx" ON "ActivityEvent"("attemptId");

-- CreateIndex
CREATE INDEX "ActivityEvent_timestamp_idx" ON "ActivityEvent"("timestamp");
