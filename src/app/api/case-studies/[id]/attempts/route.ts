import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Start a new attempt
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseStudyId } = await params;
    const body = await request.json();
    const { userId, ceEligible, disclaimerAcceptedAt } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Count existing attempts for this user + case to set attemptNumber
    const existingAttempts = await prisma.caseAttempt.count({
      where: { userId, caseStudyId },
    });

    const attempt = await prisma.caseAttempt.create({
      data: {
        userId,
        caseStudyId,
        attemptNumber: existingAttempts + 1,
        ceEligible: ceEligible ?? false,
        disclaimerAcceptedAt: disclaimerAcceptedAt ? new Date(disclaimerAcceptedAt) : null,
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Error creating attempt:", error);
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
  }
}

// GET: List user's attempts on this case
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

    const attempts = await prisma.caseAttempt.findMany({
      where: { userId, caseStudyId },
      orderBy: { startedAt: "desc" },
      include: {
        evaluation: true,
        ceCompletion: true,
      },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
