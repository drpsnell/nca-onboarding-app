export type CaseIndex = {
  id: string;
  title: string;
  region: string;
  difficulty: string;
  primaryCondition: string;
  keyConcepts: string[];
  status: string;
  synopsis?: string;
  creditHours?: number;
  estimatedMinutes?: number;
  questionCount?: number;
};

export type UserCaseProgress = {
  status: "not_started" | "in_progress" | "completed" | "ce_earned";
  activeSeconds: number;
  attemptCount: number;
};

export type CaseListResponse = {
  cases: CaseIndex[];
  progress?: Record<string, UserCaseProgress>;
};

export type SocraticQuestion = {
  id: string;
  phase: string;
  question: string;
  hints: string[];
  expectedConcepts: string[];
  teachingPoint: string;
};

export type PaceMetadata = {
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

export type QuestionResponse = {
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

export type CECompletionData = {
  certificateNumber: string;
  courseTitle: string;
  creditHours: number;
  completedAt: string;
  userName: string;
  durationMinutes: number;
  userLicense?: string | null;
};

export type CaseDetail = {
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

export type CasePhase = "ce-optin" | "course-info" | "case-work" | "self-assessment" | "evaluation" | "completion";
