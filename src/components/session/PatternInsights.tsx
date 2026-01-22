"use client";

import React from "react";
import { DetectedPattern } from "@/lib/sessions/patterns";

interface PatternInsightsProps {
  patterns: DetectedPattern[];
}

export default function PatternInsights({
  patterns
}: PatternInsightsProps) {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No long-term patterns detected yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Coaching Insights
      </h3>

      {patterns.map((p) => (
        <div
          key={p.dimension}
          className="border rounded-md p-4"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium capitalize">
              {p.dimension.replace("_", " ")}
            </p>
            <PatternBadge type={p.type} />
          </div>

          <p className="text-sm mb-2">
            {p.summary}
          </p>

          <p className="text-sm">
            <span className="font-medium">
              Recommendation:
            </span>{" "}
            {p.recommendation}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Based on {p.sessionsAnalyzed} sessions
          </p>
        </div>
      ))}
    </div>
  );
}

function PatternBadge({
  type
}: {
  type: "improving" | "declining" | "plateau";
}) {
  if (type === "improving") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
        Improving
      </span>
    );
  }

  if (type === "declining") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
        Declining
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
      Plateau
    </span>
  );
}
