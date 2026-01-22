"use client";

import React from "react";

type JourneyStatus = "locked" | "available" | "in_progress" | "completed";

interface TrainingJourneyNode {
  id: string;
  title: string;
  description: string;
  status: JourneyStatus;
  estimatedMinutes?: number;
  recommended?: boolean;
  requiredToUnlock?: string[];
}

interface TrainingJourneyProps {
  title: string;
  description: string;
  nodes: TrainingJourneyNode[];
  onNodeSelect: (node: TrainingJourneyNode) => void;
}

export default function TrainingJourney({
  title,
  description,
  nodes,
  onNodeSelect
}: TrainingJourneyProps) {
  return (
    <section className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      {/* Primary CTA */}
      <div className="mb-8">
        <button className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Continue Training
        </button>
      </div>

      {/* Journey Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

        <ul className="space-y-6">
          {nodes.map((node) => (
            <li key={node.id} className="relative">
              {/* Node dot */}
              <span
                className={getNodeDotClasses(node.status)}
              />

              {/* Node card */}
              <div
                className={getNodeCardClasses(node.status)}
                onClick={() => {
                  if (node.status !== "locked") {
                    onNodeSelect(node);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium">
                      {node.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {node.description}
                    </p>
                  </div>

                  {node.recommended && (
                    <span className="ml-3 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatStatus(node.status)}</span>

                  {node.estimatedMinutes && (
                    <span>{node.estimatedMinutes} min</span>
                  )}
                </div>

                {node.status === "locked" && node.requiredToUnlock && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Complete previous session to unlock
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function getNodeDotClasses(status: JourneyStatus) {
  const base =
    "absolute left-0 top-3 h-4 w-4 rounded-full border";

  switch (status) {
    case "completed":
      return `${base} bg-green-500 border-green-500`;
    case "available":
      return `${base} bg-primary border-primary`;
    case "in_progress":
      return `${base} bg-primary border-primary animate-pulse`;
    case "locked":
    default:
      return `${base} bg-background border-muted`;
  }
}

function getNodeCardClasses(status: JourneyStatus) {
  const base =
    "ml-6 p-4 rounded-md border transition cursor-pointer";

  if (status === "locked") {
    return `${base} opacity-60 cursor-not-allowed`;
  }

  if (status === "in_progress") {
    return `${base} border-primary`;
  }

  return `${base} hover:shadow-sm`;
}

function formatStatus(status: JourneyStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "available":
      return "Available";
    case "in_progress":
      return "In progress";
    case "locked":
    default:
      return "Locked";
  }
}
