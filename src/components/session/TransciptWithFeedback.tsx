"use client";

import React, { useRef, useState } from "react";
import {
  TranscriptLine,
  LinkedFeedback
} from "@/lib/feedback/linkedFeedback";

interface TranscriptWithFeedbackProps {
  transcript: TranscriptLine[];
  feedback: LinkedFeedback[];
}

export default function TranscriptWithFeedback({
  transcript,
  feedback
}: TranscriptWithFeedbackProps) {
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedLine, setHighlightedLine] = useState<string | null>(null);

  function focusLine(lineId: string) {
    const el = lineRefs.current[lineId];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedLine(lineId);

    setTimeout(() => {
      setHighlightedLine(null);
    }, 2000);
  }

  return (
    <div className="md:hidden space-y-6 px-4">
      {/* Transcript */}
      <div className="space-y-3">
        {transcript.map((line) => (
          <div
            key={line.id}
            ref={(el) => {
              lineRefs.current[line.id] = el;
            }}
            className={getTranscriptLineClasses(
              highlightedLine === line.id
            )}
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

      {/* Feedback */}
      <div className="space-y-4 pt-4 border-t">
        {feedback.map((item) => (
          <div key={item.id} className="border rounded-md p-4">
            <div className="mb-2">
              <p className="text-sm font-medium capitalize">
                {item.dimension.replace("_", " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Score: {item.score}/10
              </p>
            </div>

            <p className="text-sm mb-2">
              <span className="font-medium">Reason:</span>{" "}
              {item.reason}
            </p>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                Evidence:
              </p>
              {item.evidence.map((e, i) => (
                <button
                  key={i}
                  onClick={() => focusLine(e.transcriptLineId)}
                  className="block w-full text-left text-sm text-primary underline-offset-2 hover:underline"
                >
                  {e.note}
                </button>
              ))}
            </div>

            <p className="mt-2 text-sm">
              <span className="font-medium">
                Next step:
              </span>{" "}
              {item.nextStep}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTranscriptLineClasses(isHighlighted: boolean) {
  const base = "rounded-md p-3 transition";

  if (isHighlighted) {
    return `${base} bg-primary/10 border border-primary`;
  }

  return `${base} bg-muted`;
}

function labelForSpeaker(
  speaker: "user" | "persona" | "coach"
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
