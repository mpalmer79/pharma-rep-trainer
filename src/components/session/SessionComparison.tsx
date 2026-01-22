"use client";

import React from "react";
import {
  ScoreDelta
} from "@/lib/sessions/comparison";

interface SessionComparisonProps {
  previousLabel: string;
  currentLabel: string;
  deltas: ScoreDelta[];
}

export default function SessionComparison({
  previousLabel,
  currentLabel,
  deltas
}: SessionComparisonProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">
          Session Progress
        </h3>
        <p className="text-xs text-muted-foreground">
          Comparing {previousLabel} to {currentLabel}
        </p>
      </div>

      <div className="space-y-3">
        {deltas.map((d) => (
          <div
            key={d.dimension}
            className="border rounded-md p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium capitalize">
                {d.dimension.replace("_", " ")}
              </p>
              <DeltaBadge delta={d.delta} />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {previousLabel}: {d.previous}/10
              </span>
              <span>
                {currentLabel}: {d.current}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
        +{delta}
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
        {delta}
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
      0
    </span>
  );
}
