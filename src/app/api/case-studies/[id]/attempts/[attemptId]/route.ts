import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Save question responses incrementally, update progress
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    const attempt = await prisma.caseAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.questionResponses !== undefined) {
      updateData.questionResponses = body.questionResponses;
    }
    if (body.questionsAnswered !== undefined) {
      updateData.questionsAnswered = body.questionsAnswered;
    }
    if (body.selfAssessmentRatings !== undefined) {
      updateData.selfAssessmentRatings = body.selfAssessmentRatings;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const updated = await prisma.caseAttempt.update({
      where: { id: attemptId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating attempt:", error);
    return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
  }
}

// GET: Retrieve a specific attempt
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.caseAttempt.findUnique({
      where: { id: attemptId },
      include: {
        evaluation: true,
        ceCompletion: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 });
  }
}
