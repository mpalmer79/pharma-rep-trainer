"use client";

import React from "react";
import {
  ManagerRollupResult
} from "@/lib/manager/rollups";

interface ManagerInsightsProps {
  rollup: ManagerRollupResult;
}

export default function ManagerInsights({
  rollup
}: ManagerInsightsProps) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-sm font-semibold">
          Team Coaching Insights
        </h2>
        <p className="text-xs text-muted-foreground">
          Based on {rollup.totalUsers} active users
        </p>
      </header>

      <div className="space-y-4">
        {rollup.dimensionRollups.map((d) => (
          <div
            key={d.dimension}
            className="border rounded-md p-4"
          >
            <p className="text-sm font-medium capitalize mb-2">
              {d.dimension.replace("_", " ")}
            </p>

            <div className="flex gap-4 text-xs">
              <span className="text-green-700">
                Improving: {d.improvingCount}
              </span>
              <span className="text-amber-700">
                Declining: {d.decliningCount}
              </span>
              <span className="text-muted-foreground">
                Plateau: {d.plateauCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-md p-4 bg-amber-50">
        <p className="text-sm font-medium mb-1">
          Users needing attention
        </p>
        <p className="text-xs text-muted-foreground">
          {rollup.usersNeedingAttention.length === 0
            ? "No users flagged at this time."
            : rollup.usersNeedingAttention.join(", ")}
        </p>
      </div>
    </section>
  );
}
