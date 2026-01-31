"use client";

type CECompletionSummaryProps = {
  certificateNumber: string;
  courseTitle: string;
  creditHours: number;
  completedAt: string;
  userName: string;
  durationMinutes: number;
  userLicense?: string | null;
};

export default function CECompletionSummary({
  certificateNumber,
  courseTitle,
  creditHours,
  completedAt,
  userName,
  durationMinutes,
  userLicense,
}: CECompletionSummaryProps) {
  const date = new Date(completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-green-300 dark:border-green-700 p-6 bg-green-50 dark:bg-green-900/20 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-green-700 dark:text-green-400 text-sm font-medium uppercase tracking-wide">
            Continuing Education Credit Earned
          </div>
          <h3 className="text-xl font-bold">{courseTitle}</h3>
          <div className="text-3xl font-bold text-green-700 dark:text-green-400">
            {creditHours} CE {creditHours === 1 ? "Hour" : "Hours"}
          </div>
        </div>

        <div className="border-t border-green-200 dark:border-green-800 pt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-black/50 dark:text-white/50">Participant</span>
            <div className="font-medium">{userName}</div>
          </div>
          <div>
            <span className="text-black/50 dark:text-white/50">Date</span>
            <div className="font-medium">{date}</div>
          </div>
          <div>
            <span className="text-black/50 dark:text-white/50">Duration</span>
            <div className="font-medium">{durationMinutes} minutes</div>
          </div>
          <div>
            <span className="text-black/50 dark:text-white/50">Certificate #</span>
            <div className="font-medium font-mono text-xs">{certificateNumber}</div>
          </div>
          {userLicense && (
            <div className="col-span-2">
              <span className="text-black/50 dark:text-white/50">License</span>
              <div className="font-medium">{userLicense}</div>
            </div>
          )}
        </div>

        <div className="border-t border-green-200 dark:border-green-800 pt-3 text-xs text-black/50 dark:text-white/50 text-center">
          <p>Approved by Solutions Sports and Spine through the PACE program.</p>
          <p>Records retained for 5 years per PACE requirements.</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handlePrint}
          className="h-9 px-4 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
        >
          Print Certificate
        </button>
      </div>
    </div>
  );
}
