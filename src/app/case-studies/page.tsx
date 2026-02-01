"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpeechToText } from "@/components/useSpeechToText";
import CaseStudyDetail from "@/components/CaseStudyDetail";
import Link from "next/link";
import {
  FeaturedCaseCard,
  MediumCaseCard,
  SmallCaseCard,
  ComingSoonCard,
  CollectionCard,
} from "@/components/case-cards";
import { collections } from "@/data/collections";
import type {
  CaseIndex,
  CaseDetail,
  UserCaseProgress,
} from "@/lib/types/case-studies";

// --- Filter types ---
type FilterState = {
  region: string[];
  difficulty: string[];
  status: string[];
};

const REGIONS = [
  { value: "lower_quarter", label: "Lower Quarter" },
  { value: "upper_quarter", label: "Upper Quarter" },
];
const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
const STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "ce_earned", label: "CE Earned" },
];

export default function CaseStudiesPage() {
  const voiceProps = useSpeechToText();
  const [cases, setCases] = useState<CaseIndex[]>([]);
  const [progress, setProgress] = useState<Record<string, UserCaseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loadingCase, setLoadingCase] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ region: [], difficulty: [], status: [] });

  const userId = "demo-user";

  useEffect(() => {
    fetch(`/api/case-studies?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setCases(data.cases || []);
        setProgress(data.progress || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openCase = async (id: string) => {
    setLoadingCase(true);
    try {
      const res = await fetch(`/api/case-studies/${id}`);
      const data = await res.json();
      setSelectedCase(data);
    } catch {
      setSelectedCase(null);
    }
    setLoadingCase(false);
  };

  const toggleFilter = useCallback((group: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const arr = prev[group];
      return {
        ...prev,
        [group]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }, []);

  // Apply client-side filters
  const filteredCases = cases.filter((c) => {
    if (filters.region.length > 0 && !filters.region.includes(c.region)) return false;
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(c.difficulty)) return false;
    if (filters.status.length > 0) {
      const p = progress[c.id];
      const s = p?.status ?? "not_started";
      if (!filters.status.includes(s)) return false;
    }
    return true;
  });

  // Split cases into layout tiers
  const featured = filteredCases[0];
  const medium = filteredCases.slice(1, 3);
  const small = filteredCases.slice(3);
  const activeFilterCount = filters.region.length + filters.difficulty.length + filters.status.length;

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="min-h-screen p-6 sm:p-10 font-sans text-base">
        <header className="max-w-5xl mx-auto mb-6 flex items-center gap-4">
          <Link href="/" className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
            <span>&larr;</span> Dashboard
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Case Studies</h1>
        </header>
        <main className="max-w-5xl mx-auto space-y-4">
          {/* Skeleton featured card */}
          <div className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-6 animate-pulse">
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/4 mb-3" />
            <div className="h-6 bg-black/10 dark:bg-white/10 rounded w-2/3 mb-2" />
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-full mb-2" />
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4" />
          </div>
          {/* Skeleton medium cards */}
          <div className="grid grid-cols-6 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="col-span-6 sm:col-span-3 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-4 animate-pulse">
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-full" />
              </div>
            ))}
          </div>
          {/* Skeleton small cards */}
          <div className="grid grid-cols-6 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-3 animate-pulse">
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-2/3 mb-1" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // --- Detail view ---
  if (selectedCase) {
    return (
      <div className="min-h-screen p-6 sm:p-10 font-sans text-base">
        <main className="max-w-5xl mx-auto bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6">
          <CaseStudyDetail
            caseData={selectedCase}
            onBack={() => setSelectedCase(null)}
            voiceProps={voiceProps}
          />
        </main>
      </div>
    );
  }

  // --- List view ---
  return (
    <div className="min-h-screen p-6 sm:p-10 font-sans text-base">
      <header className="max-w-5xl mx-auto mb-6 flex items-center gap-4">
        <Link href="/" className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
          <span>&larr;</span> Dashboard
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Case Studies</h1>
        <div className="ml-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-3 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filters dropdown */}
      {showFilters && (
        <div className="max-w-5xl mx-auto mb-4 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f0f0f] p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <FilterGroup label="Region" options={REGIONS} selected={filters.region} onToggle={(v) => toggleFilter("region", v)} />
            <FilterGroup label="Difficulty" options={DIFFICULTIES} selected={filters.difficulty} onToggle={(v) => toggleFilter("difficulty", v)} />
            <FilterGroup label="Status" options={STATUSES} selected={filters.status} onToggle={(v) => toggleFilter("status", v)} />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({ region: [], difficulty: [], status: [] })}
              className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      <main className="max-w-5xl mx-auto space-y-8">
        {/* Latest Case Studies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Latest Case Studies</h2>
            <div className="text-sm text-black/60 dark:text-white/60">
              {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} available
            </div>
          </div>

          {loadingCase && (
            <div className="mb-4 text-sm text-black/50 dark:text-white/50 animate-pulse">Loading case...</div>
          )}

          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-black/40 dark:text-white/40 text-sm">
              No cases match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {/* Featured: first case */}
              {featured && (
                <FeaturedCaseCard
                  caseItem={featured}
                  progress={progress[featured.id]}
                  onOpen={() => openCase(featured.id)}
                />
              )}

              {/* Medium: next 2 cases */}
              {medium.map((c) => (
                <MediumCaseCard
                  key={c.id}
                  caseItem={c}
                  progress={progress[c.id]}
                  onOpen={() => openCase(c.id)}
                />
              ))}

              {/* Small: remaining cases */}
              {small.map((c) => (
                <SmallCaseCard
                  key={c.id}
                  caseItem={c}
                  progress={progress[c.id]}
                  onOpen={() => openCase(c.id)}
                />
              ))}

              {/* Coming Soon placeholders if less than 3 small cards */}
              {small.length < 3 &&
                Array.from({ length: 3 - small.length }).map((_, i) => (
                  <ComingSoonCard key={`placeholder-${i}`} />
                ))
              }
            </div>
          )}
        </section>

        {/* Curated Collections */}
        <section className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Curated Collections</h2>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {collections.map((col) => (
              <CollectionCard key={col.title} collection={col} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Filter group sub-component ---
function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-black/50 dark:text-white/50 mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              selected.includes(opt.value)
                ? "bg-foreground text-background border-transparent"
                : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
