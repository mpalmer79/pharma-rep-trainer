export type FeedbackDimension =
  | "confidence"
  | "clarity"
  | "listening"
  | "objection_handling"
  | "structure";

export interface SessionScore {
  dimension: FeedbackDimension;
  score: number;
}

export interface SessionSnapshot {
  sessionId: string;
  timestamp: string;
  scores: SessionScore[];
}

export interface ScoreDelta {
  dimension: FeedbackDimension;
  previous: number;
  current: number;
  delta: number;
}

export function compareSessions(
  previous: SessionSnapshot,
  current: SessionSnapshot
): ScoreDelta[] {
  const previousMap = new Map(
    previous.scores.map((s) => [s.dimension, s.score])
  );

  return current.scores.map((currentScore) => {
    const prev = previousMap.get(currentScore.dimension) ?? 0;

    return {
      dimension: currentScore.dimension,
      previous: prev,
      current: currentScore.score,
      delta: currentScore.score - prev
    };
  });
}
