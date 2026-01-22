"use client";

import React from "react";

interface CoachHint {
  id: string;
  message: string;
  severity?: "neutral" | "positive" | "warning";
}

interface MobileCoachOverlayProps {
  hint: CoachHint | null;
  onDismiss?: () => void;
}

export default function MobileCoachOverlay({
  hint,
  onDismiss
}: MobileCoachOverlayProps) {
  if (!hint) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 md:hidden px-4 z-50">
      <div
        className={getContainerClasses(hint.severity)}
        onClick={onDismiss}
      >
        <p className="text-sm">{hint.message}</p>
        <span className="text-[11px] opacity-70 mt-1 block">
          Tap to dismiss
        </span>
      </div>
    </div>
  );
}

function getContainerClasses(
  severity: CoachHint["severity"]
) {
  const base =
    "rounded-md px-4 py-3 shadow-md transition";

  if (severity === "positive") {
    return `${base} bg-green-600 text-white`;
  }

  if (severity === "warning") {
    return `${base} bg-amber-500 text-white`;
  }

  return `${base} bg-muted text-foreground`;
}
