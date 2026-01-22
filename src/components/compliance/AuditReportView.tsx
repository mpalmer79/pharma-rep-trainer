"use client";

import React from "react";
import { AuditReport } from "@/lib/compliance/auditReport";

interface AuditReportViewProps {
  report: AuditReport;
}

export default function AuditReportView({
  report
}: AuditReportViewProps) {
  return (
    <section className="space-y-6 text-sm">
      <header className="border-b pb-3">
        <h2 className="font-semibold">
          Training Audit Report
        </h2>
        <p className="text-xs text-muted-foreground">
          User: {report.metadata.userId} | Session: {report.metadata.sessionId}
        </p>
        <p className="text-xs text-muted-foreground">
          Generated: {report.metadata.generatedAt}
        </p>
      </header>

      {/* Transcript */}
      <div>
        <h3 className="font-medium mb-2">
          Session Transcript
        </h3>
        <ul className="space-y-1">
          {report.transcript.map((line) => (
            <li key={line.id}>
              <strong>{line.speaker}:</strong>{" "}
              {line.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback */}
      <div>
        <h3 className="font-medium mb-2">
          Coaching Feedback
        </h3>
        {report.feedback.map((f) => (
          <div
            key={f.id}
            className="border rounded-md p-3 mb-2"
          >
            <p>
              <strong>Dimension:</strong>{" "}
              {f.dimension}
            </p>
            <p>
              <strong>Reason:</strong>{" "}
              {f.reason}
            </p>
            <ul className="list-disc list-inside">
              {f.evidence.map((e, i) => (
                <li key={i}>
                  {e.note} (Line {e.transcriptLineId})
                </li>
              ))}
            </ul>
            <p>
              <strong>Next Step:</strong>{" "}
              {f.nextStep}
            </p>
          </div>
        ))}
      </div>

      {/* Patterns */}
      <div>
        <h3 className="font-medium mb-2">
          Detected Learning Patterns
        </h3>
        <ul className="list-disc list-inside">
          {report.detectedPatterns.map((p, i) => (
            <li key={i}>
              {p.dimension} — {p.type} (
              {p.sessionsAnalyzed} sessions)
            </li>
          ))}
        </ul>
      </div>

      {/* Journey Adjustments */}
      <div>
        <h3 className="font-medium mb-2">
          Journey Adjustments
        </h3>
        <ul className="list-disc list-inside">
          {report.journeyAdjustments.map((j, i) => (
            <li key={i}>
              Node {j.nodeId}: {j.action} — {j.reason}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
