export type TranscriptSpeaker = "user" | "persona" | "coach";

export interface TranscriptLine {
  id: string;
  speaker: TranscriptSpeaker;
  text: string;
}

export interface LinkedEvidence {
  transcriptLineId: string;
  note: string;
}

export interface LinkedFeedback {
  id: string;
  dimension:
    | "confidence"
    | "clarity"
    | "listening"
    | "objection_handling"
    | "structure";
  score: number;
  reason: string;
  evidence: LinkedEvidence[];
  nextStep: string;
}
