import jsPDF from "jspdf";
import { CoachingSummary } from "@/lib/exports/coachingSummary";

export function exportCoachingSummaryToPDF(
  summary: CoachingSummary
): void {
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

  // Concerns
  addSectionTitle("Areas for Improvement");
  if (summary.concerns.length === 0) {
    addLine("No concerns flagged.");
  } else {
    summary.concerns.forEach((c) => addLine(`- ${c}`));
  }

  // Adjustments
  addSectionTitle("Training Adjustments");
  if (summary.adjustments.length === 0) {
    addLine("No journey adjustments required.");
  } else {
    summary.adjustments.forEach((a) => addLine(`- ${a}`));
  }

  // Recommendation
  addSectionTitle("Recommended Next Action");
  addLine(summary.recommendedNextAction);

  // Save
  doc.save(
    `coaching-summary-${summary.metadata.userId}-${summary.metadata.sessionId}.pdf`
  );
}
