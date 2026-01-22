"use client";

import React from "react";
import { UserDrilldownSummary } from "@/lib/manager/userDrilldown";

interface UserDrilldownProps {
  summary: UserDrilldownSummary;
}

export default function UserDrilldown({
  summary
}: UserDrilldownProps) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-sm font-semibold">
          User Coaching Detail
        </h2>
        <p className="text-xs text-muted-foreground">
          User ID: {summary.userId}
        </p>
      </header>

      {/* Risk Level */}
      <div className="border rounded-md p-4">
        <p className="text-sm font-medium mb-1">
          Risk Level
        </p>
        <RiskBadge level={summary.riskLevel} />
      </div>

      {/* Coaching Focus */}
      <div className="border rounded-md p-4">
        <p className="text-sm font-medium mb-2">
          Coaching Focus Areas
        </p>
        <ul className="list-disc list-inside text-sm">
          {summary.coachingFocus.map((focus, i) => (
            <li key={i}>{focus}</li>
          ))}
        </ul>
      </div>

      {/* Recent Sessions */}
      <div className="border rounded-md p-4">
        <p className="text-sm font-medium mb-2">
          Recent Sessions
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {summary.recentSessions.map((s) => (
            <li key={s.sessionId}>
              {s.timestamp}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RiskBadge({
  level
}: {
  level: "low" | "medium" | "high";
}) {
  if (level === "high") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
        High
      </span>
    );
  }

  if (level === "medium") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
        Medium
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
      Low
    </span>
  );
}
