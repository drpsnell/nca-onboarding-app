import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: PACE reporting — participant list + evaluation summaries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const completions = await prisma.cECompletion.findMany({
      where: Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {},
      orderBy: { completedAt: "desc" },
      include: {
        user: { select: { email: true, displayName: true, licenseNumber: true, licenseState: true, licenseType: true } },
        caseStudy: { select: { title: true } },
      },
    });

    // Aggregate evaluation data
    const evaluations = await prisma.courseEvaluation.findMany({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
    });

    const evalSummary = {
      count: evaluations.length,
      avgObjectivesMet: avg(evaluations.map((e) => e.objectivesMet)),
      avgContentRelevance: avg(evaluations.map((e) => e.contentRelevance)),
      avgContentEvidence: avg(evaluations.map((e) => e.contentEvidence)),
      avgMaterialQuality: avg(evaluations.map((e) => e.materialQuality)),
      avgTimeAppropriate: avg(evaluations.map((e) => e.timeAppropriate)),
      avgWouldRecommend: avg(evaluations.map((e) => e.wouldRecommend)),
    };

    return NextResponse.json({
      participants: completions.map((c) => ({
        certificateNumber: c.certificateNumber,
        userName: c.userName,
        userLicense: c.userLicense,
        email: c.user.email,
        licenseNumber: c.user.licenseNumber,
        licenseState: c.user.licenseState,
        licenseType: c.user.licenseType,
        courseTitle: c.courseTitle,
        creditHours: c.creditHours,
        completedAt: c.completedAt,
        durationMinutes: c.durationMinutes,
        caseVersion: c.caseVersion,
      })),
      evaluationSummary: evalSummary,
    });
  } catch (error) {
    console.error("Error generating PACE report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}
