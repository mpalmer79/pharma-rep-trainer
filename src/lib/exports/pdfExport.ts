import jsPDF from "jspdf";
import { CoachingSummary } from "@/lib/exports/coachingSummary";

/**
 * Generate a coaching summary PDF and return it as a Blob.
 * This is used for email attachments, storage, and exports.
 */
export function exportCoachingSummaryToPDF(
  summary: CoachingSummary
): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  let y = 15;

  function addLine(text: string, spacing = 6) {
    doc.text(text, 15, y);
    y += spacing;
  }

  function addSectionTitle(title: string) {
    y += 4;
    doc.setFont("helvetica", "bold");
    addLine(title);
    doc.setFont("helvetica", "normal");
  }

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addLine("Coaching Summary");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Metadata
  addLine(`User ID: ${summary.metadata.userId}`);
  addLine(`Session ID: ${summary.metadata.sessionId}`);
  addLine(`Generated: ${summary.metadata.generatedAt}`);

  // Highlights
  addSectionTitle("Highlights");
  if (summary.highlights.length === 0) {
    addLine("No notable improvements detected.");
  } else {
    summary.highlights.forEach((h) => addLine(`- ${h}`));
  }

  // Areas for Improvement
  addSectionTitle("Areas for Improvement");
  if (summary.concerns.length === 0) {
    addLine("No concerns flagged.");
  } else {
    summary.concerns.forEach((c) => addLine(`- ${c}`));
  }

  // Training Adjustments
  addSectionTitle("Training Adjustments");
  if (summary.adjustments.length === 0) {
    addLine("No journey adjustments required.");
  } else {
    summary.adjustments.forEach((a) => addLine(`- ${a}`));
  }

  // Recommended Next Action
  addSectionTitle("Recommended Next Action");
  addLine(summary.recommendedNextAction);

  // IMPORTANT: return the PDF as a Blob (do NOT download)
  return doc.output("blob");
}
