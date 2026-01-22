"use client";

import React from "react";
import { CoachingSummary } from "@/lib/exports/coachingSummary";

interface CoachingSummaryViewProps {
  summary: CoachingSummary;
}

export default function CoachingSummaryView({
  summary
}: CoachingSummaryViewProps) {
  return (
    <section className="space-y-5 border rounded-md p-4 text-sm">
      <header>
        <h2 className="font-semibold">
          Coaching Summary
        </h2>
        <p className="text-xs text-muted-foreground">
          User: {summary.metadata.userId} | Session: {summary.metadata.sessionId}
        </p>
        <p className="text-xs text-muted-foreground">
          Generated: {summary.metadata.generatedAt}
        </p>
      </header>

      <div>
        <p className="font-medium mb-1">
          Highlights
        </p>
        {summary.highlights.length === 0 ? (
          <p className="text-muted-foreground">
            No notable improvements detected.
          </p>
        ) : (
          <ul className="list-disc list-inside">
            {summary.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="font-medium mb-1">
          Areas for Improvement
        </p>
        {summary.concerns.length === 0 ? (
          <p className="text-muted-foreground">
            No concerns flagged.
          </p>
        ) : (
          <ul className="list-disc list-inside">
            {summary.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="font-medium mb-1">
          Training Adjustments
        </p>
        {summary.adjustments.length === 0 ? (
          <p className="text-muted-foreground">
            No journey adjustments required.
          </p>
        ) : (
          <ul className="list-disc list-inside">
            {summary.adjustments.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-3">
        <p className="font-medium">
          Recommended Next Action
        </p>
        <p>{summary.recommendedNextAction}</p>
      </div>
    </section>
  );
}
