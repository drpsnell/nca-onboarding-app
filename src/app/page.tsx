"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSpeechToText } from "@/components/useSpeechToText";
import VoicePanel from "@/components/VoicePanel";
import Link from "next/link";

type TabKey = "learn" | "test" | "assist";

type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  contentPath: string | null;
  videoUrl: string | null;
  duration: number | null;
  readings?: Reading[];
};

type Reading = {
  id: string;
  title: string;
  author: string | null;
  type: string;
  required: boolean;
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6 sm:p-10 font-sans text-base"><div className="max-w-5xl mx-auto text-center py-8 text-black/60 dark:text-white/60">Loading...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const categoryParam = searchParams.get("category");

  const [active, setActive] = useState<TabKey>(
    tabParam && ["learn", "test", "assist"].includes(tabParam) ? tabParam : "learn"
  );

  return (
    <div className="min-h-screen p-6 sm:p-10 font-sans text-base">
      <header className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">NCA Training Dashboard</h1>
        <nav className="flex gap-2 flex-wrap">
          {[
            { key: "learn", label: "Learn" },
            { key: "test", label: "Test" },
            { key: "assist", label: "Assist" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key as TabKey)}
              className={`h-10 px-4 rounded-full border transition-colors ${
                active === t.key
                  ? "bg-foreground text-background border-transparent"
                  : "border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
          <Link
            href="/case-studies"
            className="h-10 px-4 rounded-full border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center"
          >
            Case Studies
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6">
        {active === "learn" && <LearnTab initialCategory={categoryParam} />}
        {active === "test" && <TestTab />}
        {active === "assist" && <AssistTab />}
      </main>
    </div>
  );
}

function LearnTab({ initialCategory }: { initialCategory?: string | null }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const validCategories = ["DTM", "FYOB", "FOUNDATIONS"];
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory && validCategories.includes(initialCategory) ? initialCategory : "DTM"
  );

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((data) => {
        setModules(data.modules || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { key: "DTM", label: "Dermal Traction Method", color: "bg-blue-500" },
    { key: "FYOB", label: "FYOB Strength", color: "bg-green-500" },
    { key: "FOUNDATIONS", label: "Foundations", color: "bg-purple-500" },
  ];

  const filteredModules = modules.filter((m) => m.category === activeCategory);
  const foundationsModule = modules.find((m) => m.slug === "foundations");

  if (loading) {
    return <div className="text-center py-8 text-black/60 dark:text-white/60">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">NCA Curriculum</h2>
        <div className="text-sm text-black/60 dark:text-white/60">
          {modules.length} modules available
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setSelectedModule(null);
            }}
            className={`h-9 px-4 rounded-lg border transition-colors flex items-center gap-2 ${
              activeCategory === cat.key
                ? "bg-foreground text-background border-transparent"
                : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Foundations - show reading list */}
      {activeCategory === "FOUNDATIONS" && foundationsModule?.readings && (
        <div className="space-y-3">
          <p className="text-sm text-black/70 dark:text-white/70">
            Foundational texts and references for understanding the NeuroCentric Approach.
          </p>
          <div className="grid gap-2">
            {foundationsModule.readings.map((reading) => (
              <div
                key={reading.id}
                className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] flex items-center justify-between"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {reading.title}
                    {reading.required && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-black/60 dark:text-white/60">
                    {reading.author} · {reading.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DTM and FYOB modules */}
      {activeCategory !== "FOUNDATIONS" && (
        <>
          {selectedModule ? (
            <ModuleDetail module={selectedModule} onBack={() => setSelectedModule(null)} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredModules
                .sort((a, b) => a.order - b.order)
                .map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] cursor-pointer hover:border-black/20 dark:hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{mod.title}</div>
                        <div className="text-sm text-black/70 dark:text-white/60 mt-1">
                          {mod.description}
                        </div>
                      </div>
                      <div className="text-right text-sm shrink-0">
                        {mod.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <VideoIcon /> Video
                          </span>
                        )}
                        {mod.contentPath && !mod.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <DocIcon /> Reading
                          </span>
                        )}
                      </div>
                    </div>
                    {mod.duration && (
                      <div className="mt-2 text-xs text-black/50 dark:text-white/50">
                        ~{mod.duration} min
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ModuleDetail({ module, onBack }: { module: Module; onBack: () => void }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (module.contentPath) {
      setLoading(true);
      fetch(`/api/modules/${module.slug}/content`)
        .then((r) => r.json())
        .then((data) => {
          setContent(data.content || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [module]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
      >
        <span>←</span> Back to modules
      </button>

      <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f]">
        <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
        <p className="text-black/70 dark:text-white/70 mb-4">{module.description}</p>

        {module.videoUrl && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <VideoIcon />
              <span className="font-medium">Video: {module.videoUrl}</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              Video content available in your NCA Content Library
            </p>
          </div>
        )}

        {module.contentPath && (
          <div className="space-y-3">
            <h4 className="font-medium">Module Content</h4>
            {loading ? (
              <div className="text-black/60 dark:text-white/60">Loading content...</div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap bg-black/5 dark:bg-white/5 rounded-lg p-4">
                {content || "Content not available"}
              </div>
            )}
          </div>
        )}

        {module.duration && (
          <div className="mt-4 text-sm text-black/50 dark:text-white/50">
            Estimated time: {module.duration} minutes
          </div>
        )}
      </div>
    </div>
  );
}

function VideoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TestTab() {
  const { supported, listening, transcript, start, stop, reset } = useSpeechToText();
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const generateQuestion = async () => {
    const res = await fetch("/api/rag/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Generate a single Socratic NCA clinical reasoning question." }),
    });
    const data = await res.json();
    setQuestion(data.answer || "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Test</h2>
        <div className="text-sm text-black/60 dark:text-white/60">Real-time AI questions. Not saved.</div>
      </div>

      <div className="flex gap-2">
        <button onClick={generateQuestion} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">New Question</button>
        <button onClick={() => setAnswer("")} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Clear</button>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f]">
        <div className="text-sm text-black/60 dark:text-white/60 mb-1">Question</div>
        <div className="whitespace-pre-wrap">{question || "Click New Question"}</div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">Your Answer (voice or type)</div>
        <textarea
          value={answer || transcript}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2"
          placeholder="Answer here..."
        />
        <VoicePanel supported={supported} listening={listening} transcript={transcript} start={start} stop={stop} reset={reset} compact />
      </div>
    </div>
  );
}

function AssistTab() {
  const { supported, listening, transcript, start, stop, reset } = useSpeechToText();
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const submit = async () => {
    const res = await fetch("/api/rag/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `Provide NCA-based differential suggestions for: ${input || transcript}` }),
    });
    const data = await res.json();
    setResponse(data.answer || "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Assist</h2>
        <div className="text-sm text-black/60 dark:text-white/60">Enter anonymized details, get suggestions.</div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] space-y-2">
        <input
          value={input || transcript}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3"
          placeholder="e.g., Adult with neck pain after low-speed MVC, no neuro deficits..."
        />
        <VoicePanel supported={supported} listening={listening} transcript={transcript} start={start} stop={stop} reset={reset} compact />
        <div className="flex gap-2">
          <button onClick={submit} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Suggest</button>
          <button onClick={() => { setInput(""); setResponse(""); reset(); }} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Clear</button>
        </div>
      </div>

      {response && (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
