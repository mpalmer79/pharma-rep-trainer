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

export interface DetectedPattern {
  dimension: FeedbackDimension;
  type: "improving" | "declining" | "plateau";
  sessionsAnalyzed: number;
  summary: string;
  recommendation: string;
}

export function detectPatterns(
  sessions: SessionSnapshot[],
  minSessions = 3
): DetectedPattern[] {
  if (sessions.length < minSessions) {
    return [];
  }

  const dimensionMap = new Map<
    FeedbackDimension,
    number[]
  >();

  sessions.forEach((session) => {
    session.scores.forEach((score) => {
      const list = dimensionMap.get(score.dimension) ?? [];
      list.push(score.score);
      dimensionMap.set(score.dimension, list);
    });
  });

  const patterns: DetectedPattern[] = [];

  dimensionMap.forEach((scores, dimension) => {
    if (scores.length < minSessions) return;

    const deltas = [];
    for (let i = 1; i < scores.length; i++) {
      deltas.push(scores[i] - scores[i - 1]);
    }

    const improving = deltas.every((d) => d > 0);
    const declining = deltas.every((d) => d < 0);
    const flat = deltas.every((d) => d === 0);

    if (improving) {
      patterns.push({
        dimension,
        type: "improving",
        sessionsAnalyzed: scores.length,
        summary:
          "Scores have increased consistently across sessions.",
        recommendation:
          "Continue practicing at higher difficulty to reinforce gains."
      });
    } else if (declining) {
      patterns.push({
        dimension,
        type: "declining",
        sessionsAnalyzed: scores.length,
        summary:
          "Scores have decreased consistently across sessions.",
        recommendation:
          "Review recent feedback and slow down responses to regain control."
      });
    } else if (flat) {
      patterns.push({
        dimension,
        type: "plateau",
        sessionsAnalyzed: scores.length,
        summary:
          "Scores have remained unchanged across sessions.",
        recommendation:
          "Focus on one specific improvement area during the next session."
      });
    }
  });

  return patterns;
}
