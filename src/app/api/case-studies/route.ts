import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { UserCaseProgress } from "@/lib/types/case-studies";

export async function GET(request: Request) {
  try {
    const casesDir = path.join(process.cwd(), "src/data/case-studies");
    const indexPath = path.join(casesDir, "index.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    const index = JSON.parse(raw);

    // Enrich each case with data from its JSON file
    const enrichedCases = (index.cases as Array<Record<string, unknown>>).map((entry) => {
      const enriched = { ...entry };

      // Try to read the full case JSON for additional fields
      try {
        const caseFile = path.join(casesDir, entry.file as string);
        const caseRaw = fs.readFileSync(caseFile, "utf-8");
        const caseData = JSON.parse(caseRaw);

        // Synopsis from chiefComplaint if not already in index
        if (!enriched.synopsis && caseData.presentation?.chiefComplaint) {
          enriched.synopsis = caseData.presentation.chiefComplaint;
        }

        // PACE metadata fields
        if (caseData.paceMetadata) {
          enriched.creditHours = caseData.paceMetadata.creditHours;
          enriched.estimatedMinutes = caseData.paceMetadata.estimatedMinutes;
        }

        // Question count
        if (caseData.socraticQuestions) {
          enriched.questionCount = caseData.socraticQuestions.length;
        }
      } catch {
        // Case file not readable — keep index-level data only
      }

      return enriched;
    });

    // Check for userId param to fetch progress
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let progress: Record<string, UserCaseProgress> | undefined;

    if (userId) {
      progress = {};
      const caseIds = enrichedCases.map((c) => c.id as string);

      // Get latest attempt per case
      const attempts = await prisma.caseAttempt.findMany({
        where: { userId, caseStudyId: { in: caseIds } },
        orderBy: { startedAt: "desc" },
        select: {
          caseStudyId: true,
          status: true,
          activeSeconds: true,
        },
      });

      // Get CE completions
      const completions = await prisma.cECompletion.findMany({
        where: { userId, caseStudyId: { in: caseIds } },
        select: { caseStudyId: true },
      });
      const completedCaseIds = new Set(completions.map((c) => c.caseStudyId));

      // Group attempts by case
      const attemptsByCase: Record<string, typeof attempts> = {};
      for (const a of attempts) {
        if (!attemptsByCase[a.caseStudyId]) {
          attemptsByCase[a.caseStudyId] = [];
        }
        attemptsByCase[a.caseStudyId].push(a);
      }

      for (const caseId of caseIds) {
        const caseAttempts = attemptsByCase[caseId];
        if (!caseAttempts || caseAttempts.length === 0) {
          progress[caseId] = { status: "not_started", activeSeconds: 0, attemptCount: 0 };
          continue;
        }

        const latest = caseAttempts[0];
        const totalActiveSeconds = caseAttempts.reduce((sum, a) => sum + a.activeSeconds, 0);

        let status: UserCaseProgress["status"] = "not_started";
        if (completedCaseIds.has(caseId)) {
          status = "ce_earned";
        } else if (latest.status === "COMPLETED") {
          status = "completed";
        } else if (latest.status === "IN_PROGRESS") {
          status = "in_progress";
        }

        progress[caseId] = {
          status,
          activeSeconds: totalActiveSeconds,
          attemptCount: caseAttempts.length,
        };
      }
    }

    return NextResponse.json({ cases: enrichedCases, progress });
  } catch (error) {
    console.error("Error loading case studies index:", error);
    return NextResponse.json({ cases: [], progress: undefined });
  }
}
