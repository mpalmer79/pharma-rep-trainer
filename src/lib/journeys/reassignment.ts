import { DetectedPattern } from "@/lib/sessions/patterns";
import {
  TrainingJourneyNode,
  JourneyStatus
} from "@/lib/journeys/recommendation";

export interface JourneyAdjustment {
  nodeId: string;
  action: "prioritize" | "downgrade" | "upgrade";
  reason: string;
}

/**
 * Determine how a user's journey should adapt
 * based on cross-session skill patterns.
 */
export function calculateJourneyAdjustments(
  nodes: TrainingJourneyNode[],
  patterns: DetectedPattern[]
): JourneyAdjustment[] {
  const adjustments: JourneyAdjustment[] = [];

  patterns.forEach((pattern) => {
    const relatedNodes = nodes.filter(
      (n) =>
        n.metadata?.dimension === pattern.dimension &&
        n.status !== "completed"
    );

    if (relatedNodes.length === 0) return;

    if (pattern.type === "declining") {
      relatedNodes.forEach((node) => {
        if (node.difficulty === "advanced") {
          adjustments.push({
            nodeId: node.id,
            action: "downgrade",
            reason:
              "Recent sessions show declining performance. Reinforcing fundamentals is recommended."
          });
        } else {
          adjustments.push({
            nodeId: node.id,
            action: "prioritize",
            reason:
              "Declining performance detected. Additional focused practice is recommended."
          });
        }
      });
    }

    if (pattern.type === "plateau") {
      relatedNodes.forEach((node) => {
        adjustments.push({
          nodeId: node.id,
          action: "prioritize",
          reason:
            "Performance has plateaued. Targeted repetition may unlock improvement."
        });
      });
    }

    if (pattern.type === "improving") {
      relatedNodes.forEach((node) => {
        if (node.difficulty === "intermediate") {
          adjustments.push({
            nodeId: node.id,
            action: "upgrade",
            reason:
              "Consistent improvement detected. Increasing difficulty is recommended."
          });
        }
      });
    }
  });

  return adjustments;
}
