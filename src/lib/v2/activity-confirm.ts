import type { ActivityEntry } from "@/lib/types/database";

export function isUnconfirmedMakCapture(activity: ActivityEntry): boolean {
  const source = activity.input_source ?? "";
  if (source !== "chat" && source !== "mak_capture") return false;
  return activity.evidence_strength !== "confirmed";
}

export function isConfirmedForEvidence(activity: ActivityEntry): boolean {
  const source = activity.input_source ?? "";
  if (source === "chat" || source === "mak_capture") {
    return activity.evidence_strength === "confirmed";
  }
  return Boolean((activity.raw_text ?? "").trim());
}
