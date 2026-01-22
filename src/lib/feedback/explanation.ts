export type FeedbackDimension =
  | "confidence"
  | "clarity"
  | "listening"
  | "objection_handling"
  | "structure";

export interface FeedbackExplanation {
  id: string;
  dimension: FeedbackDimension;
  score: number;
  label: string;
  reason: string;
  evidence: string[];
  nextStep: string;
}

export const FEEDBACK_LABELS: Record<FeedbackDimension, string> = {
  confidence: "Confidence",
  clarity: "Clarity",
  listening: "Active Listening",
  objection_handling: "Objection Handling",
  structure: "Response Structure"
};
