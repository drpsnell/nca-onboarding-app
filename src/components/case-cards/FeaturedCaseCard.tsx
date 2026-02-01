import type { CaseIndex, UserCaseProgress } from "@/lib/types/case-studies";
import ProgressBadge from "./ProgressBadge";
import RegionIllustration from "./RegionIllustration";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  beginner: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  intermediate: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  advanced: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

export default function FeaturedCaseCard({
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
      className="col-span-6 text-left rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-6 hover:border-black/20 dark:hover:border-white/25 transition-colors group"
    >
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor[caseItem.difficulty] || ""}`}>
              {caseItem.difficulty}
            </span>
            <span className="text-xs text-black/50 dark:text-white/50">
              {caseItem.region === "lower_quarter" ? "Lower Quarter" : "Upper Quarter"}
            </span>
            <ProgressBadge progress={progress} creditHours={caseItem.creditHours} />
          </div>

          <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {caseItem.title}
          </h3>

          {caseItem.synopsis && (
            <p className="text-sm text-black/70 dark:text-white/60 line-clamp-2">
              {caseItem.synopsis}
            </p>
          )}

          <div className="text-sm text-black/60 dark:text-white/50">
            {caseItem.primaryCondition}
          </div>

          <div className="flex flex-wrap gap-1">
            {caseItem.keyConcepts.slice(0, 6).map((k) => (
              <span key={k} className="text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60">
                {k.replace(/_/g, " ")}
              </span>
            ))}
            {caseItem.keyConcepts.length > 6 && (
              <span className="text-xs px-2 py-0.5 text-black/40 dark:text-white/40">
                +{caseItem.keyConcepts.length - 6} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1 text-xs text-black/50 dark:text-white/50">
            {caseItem.creditHours && (
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {caseItem.creditHours} CE
              </span>
            )}
            {caseItem.estimatedMinutes && <span>~{caseItem.estimatedMinutes} min</span>}
            {caseItem.questionCount && <span>{caseItem.questionCount} questions</span>}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center shrink-0">
          <RegionIllustration region={caseItem.region} difficulty={caseItem.difficulty} />
        </div>
      </div>
    </button>
  );
}
