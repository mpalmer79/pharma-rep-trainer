import { DetectedPattern } from "@/lib/sessions/patterns";

export type JourneyStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export type JourneyNodeType =
  | "onboarding"
  | "persona"
  | "objection"
  | "skill"
  | "assessment";

export interface TrainingJourneyNode {
  id: string;
  type: JourneyNodeType;
  status: JourneyStatus;
  difficulty?: "beginner" | "intermediate" | "advanced";
  metadata?: {
    dimension?: string;
  };
}

interface RecommendationResult {
  nodeId: string;
  reason: string;
}

/**
 * Recommend the next journey node based on detected learning patterns.
 * Priority order:
 * 1. Declining skill → easier related node
 * 2. Plateauing skill → repeat similar node
 * 3. Improving skill → unlock harder related node
 * 4. Otherwise → first available node
 */
export function recommendNextJourneyNode(
  nodes: TrainingJourneyNode[],
  patterns: DetectedPattern[]
): RecommendationResult | null {
  if (!nodes || nodes.length === 0) return null;

  const availableNodes = nodes.filter(
    (n) => n.status === "available"
  );

  if (availableNodes.length === 0) return null;

  // 1. Declining patterns (highest priority)
  for (const pattern of patterns) {
    if (pattern.type === "declining") {
      const match = availableNodes.find(
        (n) =>
          n.metadata?.dimension === pattern.dimension &&
          n.difficulty !== "advanced"
      );

      if (match) {
        return {
          nodeId: match.id,
          reason:
            "Recent sessions show declining performance. Reinforcing fundamentals is recommended."
        };
      }
    }
  }

  // 2. Plateau patterns
  for (const pattern of patterns) {
    if (pattern.type === "plateau") {
      const match = availableNodes.find(
        (n) => n.metadata?.dimension === pattern.dimension
      );

      if (match) {
        return {
          nodeId: match.id,
          reason:
            "Performance has plateaued. Repeating targeted practice may unlock improvement."
        };
      }
    }
  }

  // 3. Improving patterns
  for (const pattern of patterns) {
    if (pattern.type === "improving") {
      const match = availableNodes.find(
        (n) =>
          n.metadata?.dimension === pattern.dimension &&
          n.difficulty === "advanced"
      );

      if (match) {
        return {
          nodeId: match.id,
          reason:
            "Consistent improvement detected. Advancing to a higher difficulty is recommended."
        };
      }
    }
  }

  // 4. Fallback: first available node
  return {
    nodeId: availableNodes[0].id,
    reason:
      "Continuing with the next available session will help maintain progress."
  };
}
