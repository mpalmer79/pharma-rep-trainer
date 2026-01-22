export type HapticType = "light" | "medium" | "success";

export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined") return;
  if (!("vibrate" in navigator)) return;

  switch (type) {
    case "success":
      navigator.vibrate([20, 30, 20]);
      break;
    case "medium":
      navigator.vibrate(30);
      break;
    case "light":
    default:
      navigator.vibrate(10);
  }
}
