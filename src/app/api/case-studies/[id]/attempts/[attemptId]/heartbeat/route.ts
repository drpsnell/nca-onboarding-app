import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const HEARTBEAT_INCREMENT_SEC = 30; // Client sends every 30s
const MIN_HEARTBEAT_GAP_SEC = 10; // Reject heartbeats < 10s apart (anti-gaming)

type ActivityEventInput = {
  eventType: string;
  phase?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
};

// POST: Enhanced heartbeat with idle-awareness and event batching
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.caseAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        activeSeconds: true,
        idleSeconds: true,
        lastHeartbeatAt: true,
        phaseTimings: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is not in progress" }, { status: 400 });
    }

    // Anti-gaming: reject heartbeats that arrive too quickly
    const now = new Date();
    if (attempt.lastHeartbeatAt) {
      const gapMs = now.getTime() - attempt.lastHeartbeatAt.getTime();
      if (gapMs < MIN_HEARTBEAT_GAP_SEC * 1000) {
        return NextResponse.json(
          { error: "Heartbeat too frequent", activeSeconds: attempt.activeSeconds },
          { status: 429 }
        );
      }
    }

    // Parse body
    let isActive = true;
    let currentPhase: string | undefined;
    let events: ActivityEventInput[] | undefined;
    let phaseTimings: Record<string, number> | undefined;

    try {
      const body = await request.json();
      isActive = body.isActive !== false;
      currentPhase = body.currentPhase;
      events = body.events;
      phaseTimings = body.phaseTimings;
    } catch {
      // Empty body — treat as legacy heartbeat (always active)
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      lastHeartbeatAt: now,
    };

    // Only increment activeSeconds when user is active
    if (isActive) {
      updateData.activeSeconds = attempt.activeSeconds + HEARTBEAT_INCREMENT_SEC;
    } else {
      updateData.idleSeconds = attempt.idleSeconds + HEARTBEAT_INCREMENT_SEC;
    }

    // Store phase timings if provided
    if (phaseTimings) {
      updateData.phaseTimings = phaseTimings;
    }

    const updated = await prisma.caseAttempt.update({
      where: { id: attemptId },
      data: updateData,
      select: { activeSeconds: true, idleSeconds: true },
    });

    // Bulk-insert batched activity events
    if (events && events.length > 0) {
      await prisma.activityEvent.createMany({
        data: events.map((e) => ({
          attemptId,
          eventType: e.eventType,
          phase: e.phase ?? currentPhase ?? null,
          metadata: (e.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          timestamp: e.timestamp ? new Date(e.timestamp) : now,
        })),
      });
    }

    return NextResponse.json({
      activeSeconds: updated.activeSeconds,
      idleSeconds: updated.idleSeconds,
    });
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    return NextResponse.json({ error: "Failed to process heartbeat" }, { status: 500 });
  }
}
