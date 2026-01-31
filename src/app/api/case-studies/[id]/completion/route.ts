import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function generateCertificateNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `NCA-${date}-${random}`;
}

// POST: Issue CE credit (validates all PACE criteria first)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseStudyId } = await params;
    const body = await request.json();
    const { userId, attemptId } = body;

    if (!userId || !attemptId) {
      return NextResponse.json(
        { error: "userId and attemptId are required" },
        { status: 400 }
      );
    }

    // Fetch attempt with related data
    const attempt = await prisma.caseAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: true,
        caseStudy: true,
        evaluation: true,
        ceCompletion: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.ceCompletion) {
      return NextResponse.json(
        { error: "CE credit already issued for this attempt", ceCompletion: attempt.ceCompletion },
        { status: 409 }
      );
    }

    if (!attempt.ceEligible) {
      return NextResponse.json(
        { error: "This attempt was not opted in for CE credit" },
        { status: 400 }
      );
    }

    // Load case JSON for PACE metadata
    const casesDir = path.join(process.cwd(), "src/data/case-studies");
    const indexRaw = fs.readFileSync(path.join(casesDir, "index.json"), "utf-8");
    const index = JSON.parse(indexRaw);
    const entry = index.cases.find((c: { id: string }) => c.id === caseStudyId);
    let paceMetadata = null;
    if (entry) {
      const caseRaw = fs.readFileSync(path.join(casesDir, entry.file), "utf-8");
      const caseData = JSON.parse(caseRaw);
      paceMetadata = caseData.paceMetadata;
    }

    const minimumActiveMinutes = paceMetadata?.completionCriteria?.minimumActiveMinutes ?? 50;
    const totalQuestions = paceMetadata ? paceMetadata.learningObjectives.length : 0;

    // Validate PACE criteria
    const errors: string[] = [];

    // 1. All questions answered
    if (paceMetadata?.completionCriteria?.allQuestionsAnswered) {
      const responses = (attempt.questionResponses as Array<Record<string, unknown>>) || [];
      if (responses.length < (attempt.questionsAnswered || 0) || attempt.questionsAnswered === 0) {
        errors.push("All questions must be answered");
      }
    }

    // 2. Minimum active time (50 minutes = 3000 seconds)
    if (attempt.activeSeconds < minimumActiveMinutes * 60) {
      const minutesCompleted = Math.floor(attempt.activeSeconds / 60);
      errors.push(
        `Minimum ${minimumActiveMinutes} active minutes required (${minutesCompleted} completed)`
      );
    }

    // 3. Self-assessment required
    if (paceMetadata?.completionCriteria?.selfAssessmentRequired) {
      const ratings = attempt.selfAssessmentRatings as Record<string, number> | null;
      if (!ratings || Object.keys(ratings).length < totalQuestions) {
        errors.push("Self-assessment for all learning objectives is required");
      }
    }

    // 4. Post-activity evaluation required
    if (paceMetadata?.completionCriteria?.postActivityEvaluationRequired) {
      if (!attempt.evaluation) {
        errors.push("Post-activity evaluation must be submitted");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "PACE criteria not met", criteria: errors },
        { status: 400 }
      );
    }

    // All criteria met — issue CE credit
    const creditHours = paceMetadata?.creditHours ?? attempt.caseStudy.creditHours ?? 1.0;

    const ceCompletion = await prisma.cECompletion.create({
      data: {
        userId,
        caseStudyId,
        attemptId,
        creditHours,
        userName: attempt.user.displayName,
        userLicense: attempt.user.licenseNumber
          ? `${attempt.user.licenseType || ""} ${attempt.user.licenseNumber} (${attempt.user.licenseState || ""})`
          : null,
        courseTitle: attempt.caseStudy.title,
        durationMinutes: Math.floor(attempt.activeSeconds / 60),
        caseVersion: attempt.caseStudy.version,
        certificateNumber: generateCertificateNumber(),
      },
    });

    // Mark attempt as completed
    await prisma.caseAttempt.update({
      where: { id: attemptId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json(ceCompletion, { status: 201 });
  } catch (error) {
    console.error("Error issuing CE credit:", error);
    return NextResponse.json({ error: "Failed to issue CE credit" }, { status: 500 });
  }
}

// GET: Check if user has earned credit for this case
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseStudyId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
    }

    const completion = await prisma.cECompletion.findFirst({
      where: { userId, caseStudyId },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ completed: !!completion, ceCompletion: completion });
  } catch (error) {
    console.error("Error checking completion:", error);
    return NextResponse.json({ error: "Failed to check completion" }, { status: 500 });
  }
}
