"use client";

import { useState } from "react";

type CourseEvaluationProps = {
  caseStudyId: string;
  attemptId: string;
  userId: string;
  learningObjectives: string[];
  onSubmitted: () => void;
};

const likertLabels = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function CourseEvaluation({
  caseStudyId,
  attemptId,
  userId,
  learningObjectives,
  onSubmitted,
}: CourseEvaluationProps) {
  const [ratings, setRatings] = useState({
    objectivesMet: 0,
    contentRelevance: 0,
    contentEvidence: 0,
    materialQuality: 0,
    timeAppropriate: 0,
    wouldRecommend: 0,
  });
  const [objectiveRatings, setObjectiveRatings] = useState<Record<string, number>>({});
  const [mostValuable, setMostValuable] = useState("");
  const [leastValuable, setLeastValuable] = useState("");
  const [suggestedImprovements, setSuggestedImprovements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ratingQuestions = [
    { key: "objectivesMet" as const, label: "The learning objectives were met" },
    { key: "contentRelevance" as const, label: "The content was relevant to my clinical practice" },
    { key: "contentEvidence" as const, label: "The content was supported by evidence" },
    { key: "materialQuality" as const, label: "The quality of the materials was high" },
    { key: "timeAppropriate" as const, label: "The time allocated was appropriate for the content" },
    { key: "wouldRecommend" as const, label: "I would recommend this activity to a colleague" },
  ];

  const allRated = Object.values(ratings).every((v) => v >= 1);
  const allObjectivesRated =
    learningObjectives.length === 0 ||
    learningObjectives.every((_, i) => objectiveRatings[`obj-${i}`] >= 1);

  const handleSubmit = async () => {
    if (!allRated || !allObjectivesRated) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/case-studies/${caseStudyId}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          attemptId,
          ...ratings,
          mostValuable: mostValuable || null,
          leastValuable: leastValuable || null,
          suggestedImprovements: suggestedImprovements || null,
          objectiveRatings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit evaluation");
      }

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Post-Activity Evaluation</h3>
        <p className="text-sm text-black/60 dark:text-white/60">
          Please rate your experience with this continuing education activity.
        </p>
      </div>

      {/* Per-objective attainment */}
      {learningObjectives.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Objective Attainment</h4>
          <p className="text-xs text-black/50 dark:text-white/50">
            Rate how well each objective was addressed (1 = Not at all, 5 = Completely)
          </p>
          {learningObjectives.map((obj, i) => (
            <div key={i} className="space-y-1">
              <div className="text-sm">{obj}</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setObjectiveRatings((prev) => ({ ...prev, [`obj-${i}`]: val }))
                    }
                    className={`w-10 h-8 rounded border text-sm transition-colors ${
                      objectiveRatings[`obj-${i}`] === val
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
        </div>
      )}

      {/* Likert rating questions */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Activity Evaluation</h4>
        {ratingQuestions.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="text-sm">{label}</div>
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setRatings((prev) => ({ ...prev, [key]: val }))}
                  className={`w-10 h-8 rounded border text-sm transition-colors ${
                    ratings[key] === val
                      ? "bg-foreground text-background border-transparent"
                      : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {val}
                </button>
              ))}
              <span className="text-xs text-black/40 dark:text-white/40 ml-2">
                {ratings[key] > 0 ? likertLabels[ratings[key] - 1] : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Free text fields */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium block mb-1">
            What was most valuable about this activity?
          </label>
          <textarea
            value={mostValuable}
            onChange={(e) => setMostValuable(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            What was least valuable?
          </label>
          <textarea
            value={leastValuable}
            onChange={(e) => setLeastValuable(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Suggested improvements
          </label>
          <textarea
            value={suggestedImprovements}
            onChange={(e) => setSuggestedImprovements(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allRated || !allObjectivesRated || submitting}
        className="h-10 px-6 rounded-lg bg-foreground text-background font-medium disabled:opacity-40 transition-opacity"
      >
        {submitting ? "Submitting..." : "Submit Evaluation"}
      </button>
    </div>
  );
}
