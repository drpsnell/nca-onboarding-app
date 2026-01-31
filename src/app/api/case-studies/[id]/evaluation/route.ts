import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Submit post-activity evaluation (PACE requirement)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseStudyId } = await params;
    const body = await request.json();

    const {
      userId,
      attemptId,
      objectivesMet,
      contentRelevance,
      contentEvidence,
      materialQuality,
      timeAppropriate,
      wouldRecommend,
      mostValuable,
      leastValuable,
      suggestedImprovements,
      objectiveRatings,
    } = body;

    if (!userId || !attemptId) {
      return NextResponse.json(
        { error: "userId and attemptId are required" },
        { status: 400 }
      );
    }

    // Validate Likert values (1-5)
    const likertFields = [objectivesMet, contentRelevance, contentEvidence, materialQuality, timeAppropriate, wouldRecommend];
    for (const val of likertFields) {
      if (typeof val !== "number" || val < 1 || val > 5) {
        return NextResponse.json(
          { error: "All rating fields must be integers between 1 and 5" },
          { status: 400 }
        );
      }
    }

    // Check for existing evaluation on this attempt
    const existing = await prisma.courseEvaluation.findUnique({
      where: { attemptId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Evaluation already submitted for this attempt" },
        { status: 409 }
      );
    }

    const evaluation = await prisma.courseEvaluation.create({
      data: {
        userId,
        caseStudyId,
        attemptId,
        objectivesMet,
        contentRelevance,
        contentEvidence,
        materialQuality,
        timeAppropriate,
        wouldRecommend,
        mostValuable: mostValuable || null,
        leastValuable: leastValuable || null,
        suggestedImprovements: suggestedImprovements || null,
        objectiveRatings: objectiveRatings || null,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 });
  }
}
