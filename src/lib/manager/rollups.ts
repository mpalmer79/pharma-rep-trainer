import { DetectedPattern } from "@/lib/sessions/patterns";

export interface UserPatternSummary {
  userId: string;
  patterns: DetectedPattern[];
}

export interface DimensionRollup {
  dimension: string;
  improvingCount: number;
  decliningCount: number;
  plateauCount: number;
}

export interface ManagerRollupResult {
  totalUsers: number;
  dimensionRollups: DimensionRollup[];
  usersNeedingAttention: string[];
}

/**
 * Aggregate detected patterns across multiple users.
 * This produces manager-readable insight, not raw metrics.
 */
export function buildManagerRollups(
  userSummaries: UserPatternSummary[]
): ManagerRollupResult {
  const dimensionMap = new Map<string, DimensionRollup>();
  const usersNeedingAttention: string[] = [];

  userSummaries.forEach((user) => {
    let hasDecline = false;

    user.patterns.forEach((pattern) => {
      const existing =
        dimensionMap.get(pattern.dimension) ??
        {
          dimension: pattern.dimension,
          improvingCount: 0,
          decliningCount: 0,
          plateauCount: 0
        };

      if (pattern.type === "improving") {
        existing.improvingCount += 1;
      } else if (pattern.type === "declining") {
        existing.decliningCount += 1;
        hasDecline = true;
      } else if (pattern.type === "plateau") {
        existing.plateauCount += 1;
      }

      dimensionMap.set(pattern.dimension, existing);
    });

    if (hasDecline) {
      usersNeedingAttention.push(user.userId);
    }
  });

  return {
    totalUsers: userSummaries.length,
    dimensionRollups: Array.from(dimensionMap.values()),
    usersNeedingAttention
  };
}
