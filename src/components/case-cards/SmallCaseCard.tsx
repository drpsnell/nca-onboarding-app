import type { CaseIndex, UserCaseProgress } from "@/lib/types/case-studies";

const difficultyDot: Record<string, string> = {
  easy: "bg-green-500",
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500",
};

export default function SmallCaseCard({
  caseItem,
  progress,
  onOpen,
}: {
  caseItem: CaseIndex;
  progress?: UserCaseProgress;
  onOpen: () => void;
}) {
  const progressDot =
    !progress || progress.status === "not_started"
      ? "bg-black/20 dark:bg-white/20"
      : progress.status === "in_progress"
        ? "bg-blue-500"
        : "bg-green-500";

  return (
    <button
      onClick={onOpen}
      className="col-span-6 sm:col-span-3 lg:col-span-2 text-left rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-3 hover:border-black/20 dark:hover:border-white/25 transition-colors group"
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${difficultyDot[caseItem.difficulty] || "bg-gray-400"}`} />
          <h3 className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {caseItem.title}
          </h3>
        </div>

        <div className="text-xs text-black/50 dark:text-white/40 truncate">
          {caseItem.primaryCondition}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:underline">
            View Details
          </span>
          <span className={`w-2 h-2 rounded-full ${progressDot}`} title={progress?.status ?? "not_started"} />
        </div>
      </div>
    </button>
  );
}

export function ComingSoonCard() {
  return (
    <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-xl border border-dashed border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] p-3 flex items-center justify-center">
      <span className="text-xs text-black/30 dark:text-white/30">Coming Soon</span>
    </div>
  );
}
