import type { CaseIndex, UserCaseProgress } from "@/lib/types/case-studies";
import ProgressBadge from "./ProgressBadge";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  beginner: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  intermediate: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  advanced: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

export default function MediumCaseCard({
  caseItem,
  progress,
  onOpen,
}: {
  caseItem: CaseIndex;
  progress?: UserCaseProgress;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="col-span-6 sm:col-span-3 text-left rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-4 hover:border-black/20 dark:hover:border-white/25 transition-colors group"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor[caseItem.difficulty] || ""}`}>
            {caseItem.difficulty}
          </span>
          <ProgressBadge progress={progress} creditHours={caseItem.creditHours} />
        </div>

        <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {caseItem.title}
        </h3>

        {caseItem.synopsis && (
          <p className="text-sm text-black/60 dark:text-white/50 line-clamp-1">
            {caseItem.synopsis}
          </p>
        )}

        <div className="text-xs text-black/50 dark:text-white/40">
          {caseItem.primaryCondition}
        </div>

        <div className="flex items-center gap-3 pt-1 text-xs text-black/50 dark:text-white/50">
          {caseItem.creditHours && (
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {caseItem.creditHours} CE
            </span>
          )}
          {caseItem.estimatedMinutes && <span>~{caseItem.estimatedMinutes} min</span>}
        </div>
      </div>
    </button>
  );
}
