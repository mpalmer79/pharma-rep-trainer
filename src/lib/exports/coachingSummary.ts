import { DetectedPattern } from "@/lib/sessions/patterns";
import { JourneyAdjustment } from "@/lib/journeys/reassignment";

export interface CoachingSummaryMetadata {
  userId: string;
  sessionId: string;
  generatedAt: string;
}

export interface CoachingSummary {
  metadata: CoachingSummaryMetadata;
  highlights: string[];
  concerns: string[];
  adjustments: string[];
  recommendedNextAction: string;
}

/**
 * Build a concise, exportable coaching summary.
 * This output is human-readable and compliance-safe.
 */
export function buildCoachingSummary(
  metadata: CoachingSummaryMetadata,
  patterns: DetectedPattern[],
  journeyAdjustments: JourneyAdjustment[]
): CoachingSummary {
  const highlights: string[] = [];
  const concerns: string[] = [];
  const adjustments: string[] = [];

  patterns.forEach((p) => {
    if (p.type === "improving") {
      highlights.push(
        `${formatDimension(p.dimension)} is improving consistently`
      );
    }

    if (p.type === "declining") {
      concerns.push(
        `${formatDimension(p.dimension)} shows declining performance`
      );
    }

    if (p.type === "plateau") {
      concerns.push(
        `${formatDimension(p.dimension)} has plateaued`
      );
    }
  });

  journeyAdjustments.forEach((j) => {
    adjustments.push(
      `Node ${j.nodeId}: ${formatAction(j.action)}`
    );
  });

  return {
    metadata,
    highlights,
    concerns,
    adjustments,
    recommendedNextAction:
      adjustments.length > 0
        ? "Follow the updated training path recommendations"
        : "Continue with the current training journey"
  };
}

function formatDimension(dimension: string) {
  return dimension.replace("_", " ");
}

function formatAction(
  action: "prioritize" | "downgrade" | "upgrade"
) {
  switch (action) {
    case "upgrade":
      return "increase difficulty";
    case "downgrade":
      return "reinforce fundamentals";
    default:
      return "prioritize for upcoming sessions";
  }
}
