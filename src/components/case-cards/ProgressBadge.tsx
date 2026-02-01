import type { UserCaseProgress } from "@/lib/types/case-studies";

export default function ProgressBadge({
  progress,
  creditHours,
}: {
  progress?: UserCaseProgress;
  creditHours?: number;
}) {
  if (!progress || progress.status === "not_started") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50">
        Start
      </span>
    );
  }

  if (progress.status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        In Progress
      </span>
    );
  }

  if (progress.status === "ce_earned") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {creditHours ?? 1.0} CE Earned
      </span>
    );
  }

  // completed (no CE)
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Completed
    </span>
  );
}
