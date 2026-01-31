-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLINICIAN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "contentUrl" TEXT,
    "complexity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CaseAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "notes" TEXT,
    "detailJson" JSONB,
    CONSTRAINT "CaseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseAttempt_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssistUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputLen" INTEGER NOT NULL,
    "resultLen" INTEGER NOT NULL,
    CONSTRAINT "AssistUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CaseAttempt_userId_idx" ON "CaseAttempt"("userId");

-- CreateIndex
CREATE INDEX "CaseAttempt_caseStudyId_idx" ON "CaseAttempt"("caseStudyId");

-- CreateIndex
CREATE INDEX "CaseAttempt_completedAt_idx" ON "CaseAttempt"("completedAt");
