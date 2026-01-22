"use client";

import React, { useState } from "react";
import {
  FeedbackExplanation,
  FEEDBACK_LABELS
} from "@/lib/feedback/explanations";

interface ExplainableFeedbackProps {
  feedback: FeedbackExplanation[];
}

export default function ExplainableFeedback({
  feedback
}: ExplainableFeedbackProps) {
  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <FeedbackRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function FeedbackRow({ item }: { item: FeedbackExplanation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {FEEDBACK_LABELS[item.dimension]}
          </p>
          <p className="text-xs text-muted-foreground">
            Score: {item.score}/10
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-primary"
        >
          {open ? "Hide" : "Why?"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-medium">Reason:</span>{" "}
            {item.reason}
          </p>

          <div>
            <p className="font-medium">Evidence:</p>
            <ul className="list-disc list-inside text-muted-foreground">
              {item.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>

          <p>
            <span className="font-medium">Next step:</span>{" "}
            {item.nextStep}
          </p>
        </div>
      )}
    </div>
  );
}
