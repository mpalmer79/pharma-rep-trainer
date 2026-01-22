import { SessionSnapshot } from "@/lib/sessions/patterns";
import { DetectedPattern } from "@/lib/sessions/patterns";

export interface UserDrilldownSummary {
  userId: string;
  recentSessions: SessionSnapshot[];
  patterns: DetectedPattern[];
  riskLevel: "low" | "medium" | "high";
  coachingFocus: string[];
}

/**
 * Build a manager-facing drilldown summary for a single user.
 */
export function buildUserDrilldown(
  userId: string,
  sessions: SessionSnapshot[],
  patterns: DetectedPattern[]
): UserDrilldownSummary {
  const decliningCount = patterns.filter(
    (p) => p.type === "declining"
  ).length;

  const plateauCount = patterns.filter(
    (p) => p.type === "plateau"
  ).length;

  let riskLevel: "low" | "medium" | "high" = "low";

  if (decliningCount >= 2) {
    riskLevel = "high";
  } else if (decliningCount === 1 || plateauCount >= 2) {
    riskLevel = "medium";
  }

  const coachingFocus = patterns.map(
    (p) => p.dimension.replace("_", " ")
  );

  return {
    userId,
    recentSessions: sessions.slice(-5),
    patterns,
    riskLevel,
    coachingFocus
  };
}
