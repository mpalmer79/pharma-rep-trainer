"use client";

import React from "react";

export type ReplayHighlight = "good" | "missed";

export interface ReplayLine {
  id: string;
  speaker: "user" | "persona" | "coach";
  text: string;
  highlight?: ReplayHighlight;
}

interface MobileSessionReplayProps {
  transcript: ReplayLine[];
}

export default function MobileSessionReplay({
  transcript
}: MobileSessionReplayProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground md:hidden">
        No session data available.
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 md:hidden">
      {transcript.map((line) => (
        <div
          key={line.id}
          className={getLineClasses(line.highlight)}
        >
          <p className="text-xs font-medium mb-1">
            {labelForSpeaker(line.speaker)}
          </p>
          <p className="text-sm leading-relaxed">
            {line.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function getLineClasses(highlight?: ReplayHighlight) {
  const base = "rounded-md p-3";

  if (highlight === "good") {
    return `${base} bg-green-50 border border-green-200`;
  }

  if (highlight === "missed") {
    return `${base} bg-amber-50 border border-amber-200`;
  }

  return `${base} bg-muted`;
}

function labelForSpeaker(
  speaker: ReplayLine["speaker"]
) {
  switch (speaker) {
    case "user":
      return "You";
    case "persona":
      return "Customer";
    case "coach":
      return "Coach";
    default:
      return "";
  }
}
