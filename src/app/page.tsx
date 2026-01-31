"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSpeechToText } from "@/components/useSpeechToText";
import CourseEvaluation from "@/components/CourseEvaluation";
import CECompletionSummary from "@/components/CECompletionSummary";

type TabKey = "learn" | "case-studies" | "test" | "assist";

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
  const [active, setActive] = useState<TabKey>("learn");

  return (
    <div className="min-h-screen p-6 sm:p-10 font-sans text-base">
      <header className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">NCA Training Dashboard</h1>
        <nav className="flex gap-2 flex-wrap">
          {[
            { key: "learn", label: "Learn" },
            { key: "case-studies", label: "Case Studies" },
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
        </nav>
      </header>

      <main className="max-w-5xl mx-auto bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6">
        {active === "learn" && <LearnTab />}
        {active === "case-studies" && <CaseStudiesTab />}
        {active === "test" && <TestTab />}
        {active === "assist" && <AssistTab />}
      </main>
    </div>
  );
}

function LearnTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("DTM");

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

type CaseIndex = {
  id: string;
  title: string;
  region: string;
  difficulty: string;
  primaryCondition: string;
  keyConcepts: string[];
  status: string;
};

type SocraticQuestion = {
  id: string;
  phase: string;
  question: string;
  hints: string[];
  expectedConcepts: string[];
  teachingPoint: string;
};

type PaceMetadata = {
  learningObjectives: string[];
  creditHours: number;
  estimatedMinutes: number;
  creditHourJustification: string;
  targetAudience: string;
  prerequisites: string;
  author: { name: string; credentials: string };
  conflictOfInterest: string;
  educationalMethods: string[];
  completionCriteria: {
    allQuestionsAnswered: boolean;
    selfAssessmentRequired: boolean;
    postActivityEvaluationRequired: boolean;
    minimumActiveMinutes: number;
  };
};

type QuestionResponse = {
  questionId: string;
  phase: string;
  userResponse: string;
  responseLength: number;
  timeSpentSec: number;
  hintsViewed: number;
  answerRevealed: boolean;
  revealedBeforeAttempt: boolean;
  selfConfidence: number | null;
};

type CECompletionData = {
  certificateNumber: string;
  courseTitle: string;
  creditHours: number;
  completedAt: string;
  userName: string;
  durationMinutes: number;
  userLicense?: string | null;
};

type CaseDetail = {
  id: string;
  title: string;
  difficulty: string;
  region: string;
  primaryConcepts: string[];
  presentation: {
    demographics: { age: number; sex: string; occupation: string };
    chiefComplaint: string;
    hpiNarrative: string;
    pastMedicalHistory: string[];
    socialHistory: Record<string, string>;
    medicationsAllergies: { current: string[]; allergies: string };
  };
  physicalExam: Record<string, unknown>;
  socraticQuestions: SocraticQuestion[];
  keyTakeaways: string[];
  references: string[];
  paceMetadata?: PaceMetadata;
};

function CaseStudiesTab() {
  const { supported, listening, transcript, start, stop, reset } = useSpeechToText();
  const [cases, setCases] = useState<CaseIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    fetch("/api/case-studies")
      .then((r) => r.json())
      .then((data) => {
        setCases(data.cases || []);
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

  if (loading) {
    return <div className="text-center py-8 text-black/60 dark:text-white/60">Loading case studies...</div>;
  }

  if (selectedCase) {
    return <CaseStudyDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} voiceProps={{ supported, listening, transcript, start, stop, reset }} />;
  }

  const difficultyColor: Record<string, string> = {
    intermediate: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
    advanced: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    beginner: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Case Studies</h2>
        <div className="text-sm text-black/60 dark:text-white/60">
          {cases.length} cases available
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cases.map((c) => (
          <div key={c.id} className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-black/70 dark:text-white/60 mt-1">{c.primaryCondition}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor[c.difficulty] || ""}`}>
                  {c.difficulty}
                </span>
                <span className="text-xs text-black/50 dark:text-white/50">
                  {c.region === "lower_quarter" ? "Lower Quarter" : "Upper Quarter"}
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.keyConcepts.slice(0, 4).map((k) => (
                <span key={k} className="text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60">
                  {k.replace(/_/g, " ")}
                </span>
              ))}
              {c.keyConcepts.length > 4 && (
                <span className="text-xs px-2 py-0.5 text-black/40 dark:text-white/40">
                  +{c.keyConcepts.length - 4} more
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => openCase(c.id)}
                disabled={loadingCase}
                className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
              >
                {loadingCase ? "Loading..." : "Open Case"}
              </button>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                1.0 CE
              </span>
              <span className="text-xs text-black/40 dark:text-white/40">~50 min</span>
            </div>
          </div>
        ))}
      </div>

      <VoicePanel supported={supported} listening={listening} transcript={transcript} start={start} stop={stop} reset={reset} />
    </div>
  );
}

type CasePhase = "ce-optin" | "course-info" | "case-work" | "self-assessment" | "evaluation" | "completion";

function CaseStudyDetail({
  caseData,
  onBack,
  voiceProps,
}: {
  caseData: CaseDetail;
  onBack: () => void;
  voiceProps: {
    supported: boolean;
    listening: boolean;
    transcript: string;
    start: () => void;
    stop: () => void;
    reset: () => void;
  };
}) {
  // PACE flow phase
  const [phase, setPhase] = useState<CasePhase>("ce-optin");
  const [ceEligible, setCeEligible] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Attempt tracking
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Case work state
  const [activeSection, setActiveSection] = useState<"presentation" | "exam" | "questions">("presentation");
  const [currentQ, setCurrentQ] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const questionStartTime = useRef<number>(Date.now());
  const [hintsViewedThisQ, setHintsViewedThisQ] = useState(0);
  const [answerRevealedThisQ, setAnswerRevealedThisQ] = useState(false);
  const [attemptedBeforeReveal, setAttemptedBeforeReveal] = useState(false);

  // Self-assessment
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({});

  // Completion
  const [ceCompletion, setCeCompletion] = useState<CECompletionData | null>(null);
  const [completionError, setCompletionError] = useState("");

  const pace = caseData.paceMetadata;
  const question = caseData.socraticQuestions[currentQ];

  // Temporary userId for demo (in production, from auth)
  const userId = "demo-user";

  // Start heartbeat when attempt is created and CE eligible
  const startHeartbeat = useCallback((aid: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/case-studies/${caseData.id}/attempts/${aid}/heartbeat`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setActiveSeconds(data.activeSeconds);
        }
      } catch {
        // silent
      }
    }, 60000);
  }, [caseData.id]);

  // Cleanup heartbeat on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  // Create attempt
  const createAttempt = async (eligible: boolean) => {
    try {
      const res = await fetch(`/api/case-studies/${caseData.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ceEligible: eligible,
          disclaimerAcceptedAt: eligible ? new Date().toISOString() : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAttemptId(data.id);
        if (eligible) startHeartbeat(data.id);
      }
    } catch {
      // silent
    }
  };

  // Save current question response
  const saveQuestionResponse = useCallback(() => {
    if (!question || !currentAnswer.trim()) return;

    const existing = questionResponses.find((r) => r.questionId === question.id);
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);

    const response: QuestionResponse = {
      questionId: question.id,
      phase: question.phase,
      userResponse: currentAnswer,
      responseLength: currentAnswer.length,
      timeSpentSec: existing ? existing.timeSpentSec + timeSpent : timeSpent,
      hintsViewed: hintsViewedThisQ,
      answerRevealed: answerRevealedThisQ,
      revealedBeforeAttempt: answerRevealedThisQ && !attemptedBeforeReveal,
      selfConfidence: null,
    };

    setQuestionResponses((prev) => {
      const filtered = prev.filter((r) => r.questionId !== question.id);
      return [...filtered, response];
    });
  }, [question, currentAnswer, questionResponses, hintsViewedThisQ, answerRevealedThisQ, attemptedBeforeReveal]);

  // Auto-save on question navigation
  const navigateQuestion = (newIndex: number) => {
    saveQuestionResponse();
    setCurrentQ(newIndex);
    setShowHints(false);
    setShowAnswer(false);
    setHintsViewedThisQ(0);
    setAnswerRevealedThisQ(false);
    setAttemptedBeforeReveal(false);
    questionStartTime.current = Date.now();

    // Load existing answer if returning to a question
    const existing = questionResponses.find(
      (r) => r.questionId === caseData.socraticQuestions[newIndex]?.id
    );
    setCurrentAnswer(existing?.userResponse || "");
  };

  // Save progress to server
  const saveProgress = useCallback(async () => {
    if (!attemptId) return;
    try {
      await fetch(`/api/case-studies/${caseData.id}/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionResponses,
          questionsAnswered: questionResponses.length,
        }),
      });
    } catch {
      // silent
    }
  }, [attemptId, caseData.id, questionResponses]);

  // Save self-assessment
  const saveSelfAssessment = async () => {
    if (!attemptId) return;
    try {
      await fetch(`/api/case-studies/${caseData.id}/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfAssessmentRatings: selfRatings }),
      });
    } catch {
      // silent
    }
  };

  // Request CE completion
  const requestCompletion = async () => {
    if (!attemptId) return;
    setCompletionError("");
    try {
      const res = await fetch(`/api/case-studies/${caseData.id}/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, attemptId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCeCompletion(data);
        setPhase("completion");
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      } else {
        setCompletionError(
          data.criteria ? data.criteria.join("; ") : data.error || "Failed to issue CE credit"
        );
      }
    } catch {
      setCompletionError("Network error");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ===== PHASE: CE OPT-IN =====
  if (phase === "ce-optin") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
            <span>&larr;</span> Back
          </button>
          <h2 className="text-lg font-medium">{caseData.title}</h2>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-4">
          <h3 className="font-semibold text-lg">Continuing Education Credit</h3>
          <p className="text-sm text-black/70 dark:text-white/70">
            Do you want this case study to be eligible for continuing education credits?
          </p>

          {pace && (
            <div className="text-sm text-black/60 dark:text-white/60">
              {pace.creditHours} CE {pace.creditHours === 1 ? "hour" : "hours"} available &middot; ~{pace.estimatedMinutes} min
            </div>
          )}

          <div className="space-y-4 pt-2">
            <button
              onClick={() => {
                setCeEligible(true);
              }}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                ceEligible
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <div className="font-medium">Yes, I want CE credit</div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1">
                Requires 50 active minutes, self-assessment, and post-activity evaluation
              </div>
            </button>

            <button
              onClick={() => {
                setCeEligible(false);
                createAttempt(false);
                setPhase("case-work");
              }}
              className="w-full text-left p-4 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <div className="font-medium">No, just learning</div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1">
                Work through the case at your own pace without CE tracking
              </div>
            </button>
          </div>

          {ceEligible && (
            <div className="space-y-3 border-t border-black/10 dark:border-white/10 pt-4">
              <div className="text-sm text-black/70 dark:text-white/70 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                This continuing education activity is accredited by the Providers of Approved
                Continuing Education (PACE) program through Solutions Sports and Spine. Individual
                state boards determine whether PACE-approved credits are accepted in your jurisdiction.
                You are responsible for confirming your state&apos;s CE requirements.{" "}
                <a
                  href="https://pacex.fclb.org/pages/BoardRequirements.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  Review state board requirements
                </a>
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5"
                />
                <span>I acknowledge that I am responsible for determining my state&apos;s CE requirements</span>
              </label>

              <button
                onClick={() => {
                  createAttempt(true);
                  setPhase("course-info");
                }}
                disabled={!disclaimerAccepted}
                className="h-10 px-6 rounded-lg bg-foreground text-background font-medium disabled:opacity-40 transition-opacity"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PHASE: COURSE INFO =====
  if (phase === "course-info" && pace) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
            <span>&larr;</span> Back
          </button>
          <h2 className="text-lg font-medium">{caseData.title}</h2>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-4">
          <h3 className="font-semibold">Course Information</h3>

          <div>
            <h4 className="font-medium text-sm mb-2">Learning Objectives</h4>
            <ol className="text-sm list-decimal ml-5 space-y-1">
              {pace.learningObjectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-black/50 dark:text-white/50">Credit Hours:</span>{" "}
              {pace.creditHours}
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Estimated Time:</span>{" "}
              {pace.estimatedMinutes} min
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Target Audience:</span>{" "}
              {pace.targetAudience}
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Prerequisites:</span>{" "}
              {pace.prerequisites}
            </div>
          </div>

          <div className="text-sm">
            <span className="text-black/50 dark:text-white/50">Author:</span>{" "}
            {pace.author.name}, {pace.author.credentials}
          </div>

          <div className="text-sm">
            <span className="text-black/50 dark:text-white/50">Conflict of Interest:</span>{" "}
            <span className="text-black/70 dark:text-white/70">{pace.conflictOfInterest}</span>
          </div>

          <button
            onClick={() => setPhase("case-work")}
            className="h-10 px-6 rounded-lg bg-foreground text-background font-medium"
          >
            Begin Case Study
          </button>
        </div>
      </div>
    );
  }

  // ===== PHASE: SELF-ASSESSMENT =====
  if (phase === "self-assessment" && pace) {
    const allRated = pace.learningObjectives.every((_, i) => selfRatings[`obj-${i}`] >= 1);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">{caseData.title}</h2>
          {ceEligible && (
            <span className="text-xs text-black/50 dark:text-white/50 font-mono">
              {formatTime(activeSeconds)}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-6">
          <div>
            <h3 className="font-semibold text-lg">Self-Assessment</h3>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              Rate your mastery of each learning objective (1 = Not at all, 5 = Completely mastered).
              This is a self-assessment, not a scored exam.
            </p>
          </div>

          {pace.learningObjectives.map((obj, i) => (
            <div key={i} className="space-y-1">
              <div className="text-sm">{obj}</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelfRatings((prev) => ({ ...prev, [`obj-${i}`]: val }))}
                    className={`w-10 h-8 rounded border text-sm transition-colors ${
                      selfRatings[`obj-${i}`] === val
                        ? "bg-foreground text-background border-transparent"
                        : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={async () => {
              await saveSelfAssessment();
              setPhase("evaluation");
            }}
            disabled={!allRated}
            className="h-10 px-6 rounded-lg bg-foreground text-background font-medium disabled:opacity-40"
          >
            Continue to Evaluation
          </button>
        </div>
      </div>
    );
  }

  // ===== PHASE: EVALUATION =====
  if (phase === "evaluation" && pace && attemptId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">{caseData.title}</h2>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f]">
          <CourseEvaluation
            caseStudyId={caseData.id}
            attemptId={attemptId}
            userId={userId}
            learningObjectives={pace.learningObjectives}
            onSubmitted={async () => {
              await requestCompletion();
            }}
          />
          {completionError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {completionError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PHASE: COMPLETION =====
  if (phase === "completion" && ceCompletion) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2">
            <span>&larr;</span> Back to Cases
          </button>
          <h2 className="text-lg font-medium">{caseData.title}</h2>
        </div>

        <CECompletionSummary {...ceCompletion} />
      </div>
    );
  }

  // ===== PHASE: CASE WORK =====
  const sections = [
    { key: "presentation" as const, label: "Presentation" },
    { key: "exam" as const, label: "Exam Findings" },
    { key: "questions" as const, label: `Questions (${caseData.socraticQuestions.length})` },
  ];

  const answeredCount = questionResponses.filter((r) => r.userResponse.trim().length > 0).length;
  const isLastQuestion = currentQ === caseData.socraticQuestions.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            saveQuestionResponse();
            saveProgress();
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            onBack();
          }}
          className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
        >
          <span>&larr;</span> Back
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-medium">{caseData.title}</h2>
          <div className="text-sm text-black/60 dark:text-white/60">
            {caseData.difficulty} &middot; {caseData.region === "lower_quarter" ? "Lower Quarter" : "Upper Quarter"}
          </div>
        </div>
        {ceEligible && (
          <div className="text-right">
            <div className="text-sm font-mono text-black/60 dark:text-white/60">
              {formatTime(activeSeconds)}
            </div>
            <div className="text-xs text-black/40 dark:text-white/40">active time</div>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`h-9 px-4 rounded-lg border transition-colors ${
              activeSection === s.key
                ? "bg-foreground text-background border-transparent"
                : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
        {ceEligible && (
          <div className="ml-auto text-xs text-black/50 dark:text-white/50 self-center">
            {answeredCount}/{caseData.socraticQuestions.length} answered
          </div>
        )}
      </div>

      {/* Presentation */}
      {activeSection === "presentation" && (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-black/50 dark:text-white/50">Age:</span>{" "}
              {caseData.presentation.demographics.age}
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Sex:</span>{" "}
              {caseData.presentation.demographics.sex}
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Occupation:</span>{" "}
              {caseData.presentation.demographics.occupation}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Chief Complaint</h4>
            <p className="text-sm">{caseData.presentation.chiefComplaint}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">History of Present Illness</h4>
            <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed">
              {caseData.presentation.hpiNarrative}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Past Medical History</h4>
            <ul className="text-sm list-disc ml-5 space-y-1">
              {caseData.presentation.pastMedicalHistory.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Social History</h4>
              <dl className="text-sm space-y-1">
                {Object.entries(caseData.presentation.socialHistory).map(([k, v]) => (
                  <div key={k}>
                    <dt className="inline text-black/50 dark:text-white/50 capitalize">{k}: </dt>
                    <dd className="inline">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h4 className="font-medium mb-1">Medications &amp; Allergies</h4>
              <div className="text-sm space-y-1">
                {caseData.presentation.medicationsAllergies.current.map((m, i) => (
                  <div key={i}>{m}</div>
                ))}
                <div className="text-black/50 dark:text-white/50">
                  Allergies: {caseData.presentation.medicationsAllergies.allergies}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Findings */}
      {activeSection === "exam" && (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-4">
          {Object.entries(caseData.physicalExam).map(([key, value]) => (
            <div key={key}>
              <h4 className="font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
              {typeof value === "string" ? (
                <p className="text-sm text-black/80 dark:text-white/80">{value}</p>
              ) : (
                <pre className="text-sm text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 rounded-lg p-3 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Socratic Questions */}
      {activeSection === "questions" && question && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
            <span>Question {currentQ + 1} of {caseData.socraticQuestions.length}</span>
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 capitalize">{question.phase}</span>
          </div>

          <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f]">
            <p className="font-medium text-lg leading-relaxed">{question.question}</p>
          </div>

          {/* Voice / text answer area */}
          <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-[#0f0f0f] space-y-2">
            <div className="text-sm text-black/60 dark:text-white/60">Your answer (voice or type)</div>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm"
              placeholder="Work through your reasoning here..."
              value={currentAnswer || voiceProps.transcript}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                if (!attemptedBeforeReveal && e.target.value.trim().length > 0) {
                  setAttemptedBeforeReveal(true);
                }
              }}
            />
            <VoicePanel {...voiceProps} compact />
          </div>

          {/* Hints */}
          <div>
            <button
              onClick={() => {
                if (!showHints) setHintsViewedThisQ((prev) => prev + 1);
                setShowHints(!showHints);
              }}
              className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              {showHints ? "Hide Hints" : "Show Hints"}
            </button>
            {showHints && (
              <ul className="mt-2 text-sm list-disc ml-5 space-y-1 text-black/70 dark:text-white/70">
                {question.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Expected answer */}
          <div>
            <button
              onClick={() => {
                if (!showAnswer) setAnswerRevealedThisQ(true);
                setShowAnswer(!showAnswer);
              }}
              className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              {showAnswer ? "Hide Answer" : "Reveal Answer"}
            </button>
            {showAnswer && (
              <div className="mt-2 space-y-3">
                <ul className="text-sm list-disc ml-5 space-y-1">
                  {question.expectedConcepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <div className="text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Teaching Point: </span>
                  {question.teachingPoint}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => navigateQuestion(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
            >
              Previous
            </button>
            {!isLastQuestion && (
              <button
                onClick={() => navigateQuestion(currentQ + 1)}
                className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Next
              </button>
            )}
            {isLastQuestion && ceEligible && (
              <button
                onClick={async () => {
                  saveQuestionResponse();
                  await saveProgress();
                  setPhase("self-assessment");
                }}
                className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm"
              >
                Continue to Self-Assessment
              </button>
            )}
          </div>

          {/* Key Takeaways (show after last question when answer revealed) */}
          {isLastQuestion && showAnswer && (
            <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-[#0f0f0f] space-y-3">
              <h4 className="font-medium">Key Takeaways</h4>
              <ol className="text-sm list-decimal ml-5 space-y-2">
                {caseData.keyTakeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
              <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                <h4 className="font-medium text-sm mb-1">References</h4>
                <ul className="text-xs text-black/60 dark:text-white/60 space-y-0.5">
                  {caseData.references.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {!ceEligible && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={onBack}
                    className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm"
                  >
                    Back to Cases
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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

function VoicePanel({
  supported,
  listening,
  transcript,
  start,
  stop,
  reset,
  compact,
}: {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-black/10 dark:border-white/15 p-3 ${compact ? "" : "bg-white dark:bg-[#0f0f0f]"}`}>
      <div className="flex items-center gap-2">
        <button onClick={start} disabled={!supported || listening} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 disabled:opacity-50">Start</button>
        <button onClick={stop} disabled={!supported || !listening} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 disabled:opacity-50">Stop</button>
        <button onClick={reset} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15">Reset</button>
        <div className="text-sm text-black/60 dark:text-white/60 ml-auto">{supported ? (listening ? "Listening…" : "Idle") : "Voice not supported"}</div>
      </div>
      {!compact && (
        <div className="mt-2 text-sm text-black/70 dark:text-white/70 whitespace-pre-wrap min-h-6">
          {transcript}
        </div>
      )}
    </div>
  );
}

