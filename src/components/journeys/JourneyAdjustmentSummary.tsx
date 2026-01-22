"use client";

import React from "react";
import { JourneyAdjustment } from "@/lib/journeys/reassignment";

interface JourneyAdjustmentSummaryProps {
  adjustments: JourneyAdjustment[];
}

export default function JourneyAdjustmentSummary({
  adjustments
}: JourneyAdjustmentSummaryProps) {
  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No journey adjustments recommended at this time.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold">
        Training Path Adjustments
      </h3>

      {adjustments.map((adj, i) => (
        <div
          key={i}
          className="border rounded-md p-4"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">
              Node: {adj.nodeId}
            </p>
            <AdjustmentBadge action={adj.action} />
          </div>

          <p className="text-sm">
            {adj.reason}
          </p>
        </div>
      ))}
    </section>
  );
}

function AdjustmentBadge({
  action
}: {
  action: "prioritize" | "downgrade" | "upgrade";
}) {
  if (action === "upgrade") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
        Increase difficulty
      </span>
    );
  }

  if (action === "downgrade") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
        Reinforce basics
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
        Prioritize
      </span>
  );
}
