"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useIdleDetection } from "./useIdleDetection";

type ActivityEvent = {
  eventType: string;
  phase?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds
const MAX_BATCH_SIZE = 50;

export function useActivityTracker({
  attemptId,
  caseStudyId,
  enabled,
}: {
  attemptId: string | null;
  caseStudyId: string;
  enabled: boolean;
}) {
  const { isIdle, idleSince } = useIdleDetection();
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [currentPhase, setCurrentPhaseState] = useState<string | null>(null);
  const phaseTimingsRef = useRef<Record<string, number>>({});
  const phaseStartRef = useRef<number | null>(null);
  const eventBatchRef = useRef<ActivityEvent[]>([]);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIdleRef = useRef(false);

  // Track phase enter/exit
  const setPhase = useCallback((phase: string) => {
    const now = Date.now();

    // Exit previous phase
    if (currentPhase && phaseStartRef.current) {
      const elapsed = Math.floor((now - phaseStartRef.current) / 1000);
      phaseTimingsRef.current[currentPhase] = (phaseTimingsRef.current[currentPhase] || 0) + elapsed;
      eventBatchRef.current.push({
        eventType: "phase_exited",
        phase: currentPhase,
        metadata: { elapsedSeconds: elapsed },
        timestamp: new Date(now).toISOString(),
      });
    }

    // Enter new phase
    setCurrentPhaseState(phase);
    phaseStartRef.current = now;
    eventBatchRef.current.push({
      eventType: "phase_entered",
      phase,
      timestamp: new Date(now).toISOString(),
    });
  }, [currentPhase]);

  // Log arbitrary events
  const logEvent = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    eventBatchRef.current.push({
      eventType,
      phase: currentPhase ?? undefined,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }, [currentPhase]);

  // Track idle transitions
  useEffect(() => {
    if (!enabled || !attemptId) return;

    if (isIdle && !prevIdleRef.current) {
      logEvent("idle_start");
      if (document.hidden) {
        logEvent("tab_hidden");
      }
    } else if (!isIdle && prevIdleRef.current) {
      logEvent("idle_end");
      if (!document.hidden) {
        logEvent("tab_visible");
      }
    }
    prevIdleRef.current = isIdle;
  }, [isIdle, enabled, attemptId, logEvent]);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!attemptId) return;

    // Drain the event batch
    const events = eventBatchRef.current.splice(0, MAX_BATCH_SIZE);

    try {
      const res = await fetch(
        `/api/case-studies/${caseStudyId}/attempts/${attemptId}/heartbeat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: !isIdle,
            currentPhase: currentPhase ?? undefined,
            events: events.length > 0 ? events : undefined,
            phaseTimings: phaseTimingsRef.current,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setActiveSeconds(data.activeSeconds);
      }
    } catch {
      // Put events back on failure
      eventBatchRef.current.unshift(...events);
    }
  }, [attemptId, caseStudyId, isIdle, currentPhase]);

  // Heartbeat interval
  useEffect(() => {
    if (!enabled || !attemptId) return;

    // Send an immediate heartbeat on start
    sendHeartbeat();

    heartbeatRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [enabled, attemptId, sendHeartbeat]);

  return {
    activeSeconds,
    isIdle,
    idleSince,
    setPhase,
    logEvent,
    phaseTimings: phaseTimingsRef.current,
  };
}
