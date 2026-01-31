"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/metrics/overview")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen p-6 sm:p-10">
        <div className="max-w-md mx-auto rounded-2xl border border-black/10 dark:border-white/15 p-6">
          <h1 className="text-lg font-medium mb-3">Admin</h1>
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
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Admin Overview</h1>
        {!metrics ? (
          <div className="text-sm text-black/60 dark:text-white/60">Loading metrics…</div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            <Kpi label="Active Clinicians (30d)" value={metrics.activeClinicians30d} />
            <Kpi label="Total Attempts" value={metrics.totalAttempts} />
            <Kpi label="Avg Score (30d)" value={metrics.avgScore30d?.toFixed?.(1) ?? "-"} />
          </div>
        )}
        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4">
          <div className="font-medium mb-2">Top Performers (pseudonymous)</div>
          <ul className="text-sm list-disc ml-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {metrics?.topPerformers?.map((p: any) => (
              <li key={p.userId}>{p.alias}: {p.avgScore.toFixed(1)}</li>
            )) || <li>—</li>}
          </ul>
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



