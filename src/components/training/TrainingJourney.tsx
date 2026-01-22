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
    <section className="w-full max-w-3xl mx-auto px-4 pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 md:line-clamp-none">
          {description}
        </p>
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:block mb-8">
        <button className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Continue Training
        </button>
      </div>

      {/* Journey Timeline */}
      <div className="relative pl-4 md:pl-6">
        <div className="absolute left-1.5 md:left-2 top-0 bottom-0 w-px bg-border" />

        <ul className="space-y-4 md:space-y-6">
          {nodes.map((node) => (
            <li key={node.id} className="relative">
              <span className={getNodeDotClasses(node.status)} />

              <div
                className={getNodeCardClasses(node.status)}
                onClick={() => {
                  if (node.status !== "locked") {
                    onNodeSelect(node);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">
                      {node.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {node.description}
                    </p>
                  </div>

                  {node.recommended && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary">
                      Next
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{formatStatus(node.status)}</span>
                  {node.estimatedMinutes && (
                    <span>{node.estimatedMinutes} min</span>
                  )}
                </div>

                {node.status === "locked" && node.requiredToUnlock && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Complete previous session to unlock
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-background px-4 py-3">
        <button className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Continue Training
        </button>
      </div>
    </section>
  );
}

function getNodeDotClasses(status: JourneyStatus) {
  const base =
    "absolute left-0 top-3 h-3 w-3 md:h-4 md:w-4 rounded-full border";

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
    "ml-4 md:ml-6 p-3 md:p-4 rounded-md border transition";

  if (status === "locked") {
    return `${base} opacity-60`;
  }

  return `${base} hover:shadow-sm cursor-pointer`;
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
