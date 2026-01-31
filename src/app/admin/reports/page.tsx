"use client";

import { useEffect, useState } from "react";

type Participant = {
  certificateNumber: string;
  userName: string;
  email: string;
  licenseType: string;
  licenseNumber: string;
  licenseState: string;
  courseTitle: string;
  creditHours: number;
  completedAt: string;
  durationMinutes: number;
  caseVersion: string;
};

type EvalSummary = {
  totalEvaluations: number;
  averages: Record<string, number>;
};

export default function PaceReportsPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evalSummary, setEvalSummary] = useState<EvalSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/reports/pace?${params}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        setEvalSummary(data.evaluationSummary || null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`/api/admin/reports/pace/export?${params}`, "_blank");
  };

  if (!authed) {
    return (
      <div className="min-h-screen p-6 sm:p-10">
        <div className="max-w-md mx-auto rounded-2xl border border-black/10 dark:border-white/15 p-6">
          <h1 className="text-lg font-medium mb-3">PACE Reports</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 mb-3"
          />
          <button
            onClick={async () => {
              const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
              });
              if (res.ok) setAuthed(true);
            }}
            className="h-10 px-4 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">PACE CE Reports</h1>
          <a
            href="/admin"
            className="text-sm text-black/60 dark:text-white/60 hover:underline"
          >
            Back to Admin
          </a>
        </div>

        {/* Date range filter */}
        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium block mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="h-10 px-4 rounded-lg bg-foreground text-background font-medium text-sm disabled:opacity-40"
          >
            {loading ? "Loading..." : "Filter"}
          </button>
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
          >
            Export CSV
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Kpi label="Total Completions" value={participants.length} />
          <Kpi
            label="Total CE Hours"
            value={participants.reduce((sum, p) => sum + p.creditHours, 0)}
          />
          <Kpi
            label="Evaluations"
            value={evalSummary?.totalEvaluations ?? 0}
          />
        </div>

        {/* Evaluation averages */}
        {evalSummary && evalSummary.totalEvaluations > 0 && (
          <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4">
            <h2 className="font-medium mb-3">Evaluation Averages (1-5)</h2>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              {Object.entries(evalSummary.averages).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-black/60 dark:text-white/60">
                    {formatEvalKey(key)}
                  </span>
                  <span className="font-medium">{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participant table */}
        <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden">
          <div className="p-4 border-b border-black/10 dark:border-white/15">
            <h2 className="font-medium">Participants ({participants.length})</h2>
          </div>
          {participants.length === 0 ? (
            <div className="p-4 text-sm text-black/60 dark:text-white/60">
              {loading ? "Loading..." : "No completions found for this date range."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/15 text-left">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">License</th>
                    <th className="p-3 font-medium">Course</th>
                    <th className="p-3 font-medium">Credits</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Duration</th>
                    <th className="p-3 font-medium">Certificate #</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr
                      key={p.certificateNumber}
                      className="border-b border-black/5 dark:border-white/5"
                    >
                      <td className="p-3">{p.userName}</td>
                      <td className="p-3 text-black/60 dark:text-white/60">
                        {p.licenseType ? `${p.licenseType} ${p.licenseNumber} (${p.licenseState})` : "-"}
                      </td>
                      <td className="p-3">{p.courseTitle}</td>
                      <td className="p-3">{p.creditHours}</td>
                      <td className="p-3">
                        {new Date(p.completedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">{p.durationMinutes} min</td>
                      <td className="p-3 font-mono text-xs">{p.certificateNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f]">
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function formatEvalKey(key: string): string {
  const map: Record<string, string> = {
    objectivesMet: "Objectives Met",
    contentRelevance: "Content Relevance",
    contentEvidence: "Evidence-Based",
    materialQuality: "Material Quality",
    timeAppropriate: "Time Appropriate",
    wouldRecommend: "Would Recommend",
  };
  return map[key] || key;
}
