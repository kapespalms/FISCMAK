import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { CRISIS_LANGUAGE_PATTERN } from "@/lib/v2/escalation-protocols";
import type { NarrativeEvidenceRow } from "@/lib/v2/types";

export type { NarrativeEvidenceRow } from "@/lib/v2/types";

export type NarrativeEvidenceInput = {
  userId: string;
  domainIndex: number;
  questionIndex: number;
  responseText: string;
  energySignal?: number | null;
  invisibleWorkFlag?: boolean;
  makSessionId?: string | null;
};

// Distress detection — mirrors CRISIS_LANGUAGE_PATTERN + MDT language cues.
// Never auto-reports; flag only triggers a resource link in the UI.
function detectDistress(text: string): boolean {
  if (CRISIS_LANGUAGE_PATTERN.test(text)) return true;
  return /overwhelmed.*every day|can't keep going|nothing matters|burned? out completely|leaving medicine/i.test(text);
}

export async function writeNarrativeEvidence(
  input: NarrativeEvidenceInput,
  demo: boolean,
): Promise<NarrativeEvidenceRow> {
  const row: NarrativeEvidenceRow = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    domain_index: input.domainIndex,
    question_index: input.questionIndex,
    response_text: input.responseText,
    distress_flag: detectDistress(input.responseText),
    energy_signal: input.energySignal ?? null,
    invisible_work_flag: input.invisibleWorkFlag ?? false,
    mak_session_id: input.makSessionId ?? null,
    created_at: new Date().toISOString(),
  };

  if (demo) {
    getServerDemo(input.userId).narrativeEvidence.push(row);
  } else {
    const supabase = await createClient();
    await supabase.from("narrative_evidence").insert({
      id: row.id,
      user_id: row.user_id,
      domain_index: row.domain_index,
      question_index: row.question_index,
      response_text: row.response_text,
      distress_flag: row.distress_flag,
      energy_signal: row.energy_signal,
      invisible_work_flag: row.invisible_work_flag,
      mak_session_id: row.mak_session_id,
    });
  }

  return row;
}

export async function fetchNarrativeEvidence(
  userId: string,
  demo: boolean,
  domainIndex?: number,
): Promise<NarrativeEvidenceRow[]> {
  if (demo) {
    const all = getServerDemo(userId).narrativeEvidence;
    return domainIndex != null ? all.filter((r) => r.domain_index === domainIndex) : all;
  }

  const supabase = await createClient();
  let query = supabase
    .from("narrative_evidence")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (domainIndex != null) {
    query = query.eq("domain_index", domainIndex);
  }

  const { data } = await query;
  return (data as NarrativeEvidenceRow[]) ?? [];
}
