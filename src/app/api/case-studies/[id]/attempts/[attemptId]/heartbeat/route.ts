import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Active time ping (every 60s from client); increments activeSeconds
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.caseAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, status: true, activeSeconds: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is not in progress" }, { status: 400 });
    }

    const updated = await prisma.caseAttempt.update({
      where: { id: attemptId },
      data: { activeSeconds: attempt.activeSeconds + 60 },
      select: { activeSeconds: true },
    });

    return NextResponse.json({ activeSeconds: updated.activeSeconds });
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    return NextResponse.json({ error: "Failed to process heartbeat" }, { status: 500 });
  }
}
