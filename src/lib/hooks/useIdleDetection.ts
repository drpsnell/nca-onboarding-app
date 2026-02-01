"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function useIdleDetection() {
  const [isIdle, setIsIdle] = useState(false);
  const [idleSince, setIdleSince] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isIdle) {
      setIsIdle(false);
      setIdleSince(null);
    }

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      setIdleSince(Date.now());
    }, IDLE_TIMEOUT_MS);
  }, [isIdle]);

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"] as const;

    const handleActivity = () => resetTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsIdle(true);
        setIdleSince(Date.now());
      } else {
        resetTimer();
      }
    };

    for (const ev of activityEvents) {
      window.addEventListener(ev, handleActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // Start the initial timer
    resetTimer();

    return () => {
      for (const ev of activityEvents) {
        window.removeEventListener(ev, handleActivity);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { isIdle, idleSince };
}
