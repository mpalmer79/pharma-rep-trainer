import { TranscriptLine } from "@/lib/feedback/linkedFeedback";
import { LinkedFeedback } from "@/lib/feedback/linkedFeedback";
import { JourneyAdjustment } from "@/lib/journeys/reassignment";
import { DetectedPattern } from "@/lib/sessions/patterns";

export interface AuditMetadata {
  userId: string;
  sessionId: string;
  generatedAt: string;
  reviewer?: string;
}

export interface AuditReport {
  metadata: AuditMetadata;
  transcript: TranscriptLine[];
  feedback: LinkedFeedback[];
  detectedPatterns: DetectedPattern[];
  journeyAdjustments: JourneyAdjustment[];
}

/**
 * Build a compliance-ready audit report.
 * This object is immutable and export-safe.
 */
export function buildAuditReport(
  metadata: AuditMetadata,
  transcript: TranscriptLine[],
  feedback: LinkedFeedback[],
  detectedPatterns: DetectedPattern[],
  journeyAdjustments: JourneyAdjustment[]
): AuditReport {
  return {
    metadata,
    transcript,
    feedback,
    detectedPatterns,
    journeyAdjustments
  };
}
