/**
 * B4: Mak → capture router.
 * Detects the capture lane for a conversational turn and annotates the
 * activity_entries row with energy_valence + input_source lane + scope.
 *
 * Lanes mirror §2 of the Capture Architecture Spec:
 *   career_item      — visible accomplishments (OV/SV)
 *   invisible_energy — invisible/unrecognized work + energy signal (OI/SI)
 *   patient_care     — clinical volume (aggregate, PHI-safe categories only)
 *   hours            — duty/shift hours (visible side only)
 *   goal             — goal or planning utterance → goal_records
 *   career_direction — transition/fit exploration → O*NET (future)
 *   general          — unclassified Mak conversation (not staged)
 */

export type MakCaptureLane =
  | "career_item"
  | "invisible_energy"
  | "patient_care"
  | "hours"
  | "goal"
  | "career_direction"
  | "general";

export type MakLaneResult = {
  lane: MakCaptureLane;
  energyValence: "energizing" | "draining" | null;
  invisibleWorkSignal: boolean;
  scope: string | null;
};

const CAREER_ITEM = /\b(published|publication|awarded|award|presented|presentation|joined|committee|grant|fellowship|board|credential|certification|completed.*course|certification|lecture|workshop|chapter|textbook)\b/i;
const INVISIBLE_ENERGY = /\b(prior auth|preauthoriz|pa request|administrative|admin work|after.hours|ehr|inbox|inbox messages|documentation|paperwork|coordinat|medicat reconcil|social work|placement|dispo|transfer|on.call message|covering|no one (sees|notices|knows)|invisible|unrecognized|unrewarded|unpaid|extra work|committee work nobody|no credit)\b/i;
const PATIENT_CARE = /\b(patient|clinic|admit|admission|consult|procedure|surgery|rounds|case|ed|er|icu|floor|ward|discharge)\b/i;
const HOURS = /\b(\d+.hour|long (shift|day|week|call)|overnight|post.call|worked all|on call|night shift|24.hour|36.hour)\b/i;
const GOAL = /\b(goal|want to|hoping to|planning to|aim to|working toward|milestone|career plan|next year|five.year)\b/i;
const CAREER_DIRECTION = /\b(leave medicine|leaving medicine|industry|pharma|consulting|policy|transition|pivot|alternative career|non.clinical|step away|consider.*leaving|thinking about (leaving|switching|changing))\b/i;

const BOOST = /\b(energized|energizing|love|loved|fulfilling|fulfillment|motivated|rewarding|meaningful|exciting|proud|joy|passion|best part|thriving|galvanized)\b/i;
const DRAIN = /\b(drained|draining|exhausted|exhausting|overwhelm|burnout|burned out|dreading|dread|hate|miserable|depleted|soul-sucking|grinding|resentful|pointless|meaningless|frustrated)\b/i;

export function detectMakLane(message: string): MakLaneResult {
  const lower = message.toLowerCase();

  const isBoost = BOOST.test(lower);
  const isDrain = DRAIN.test(lower);
  const energyValence: MakLaneResult["energyValence"] = isBoost && !isDrain
    ? "energizing"
    : isDrain
      ? "draining"
      : null;

  if (INVISIBLE_ENERGY.test(lower)) {
    return {
      lane: "invisible_energy",
      energyValence: energyValence ?? "draining",
      invisibleWorkSignal: true,
      scope: "invisible",
    };
  }

  if (CAREER_DIRECTION.test(lower)) {
    return { lane: "career_direction", energyValence, invisibleWorkSignal: false, scope: null };
  }

  if (GOAL.test(lower)) {
    return { lane: "goal", energyValence, invisibleWorkSignal: false, scope: null };
  }

  if (CAREER_ITEM.test(lower)) {
    return {
      lane: "career_item",
      energyValence,
      invisibleWorkSignal: false,
      scope: "visible",
    };
  }

  if (HOURS.test(lower)) {
    return { lane: "hours", energyValence, invisibleWorkSignal: false, scope: "visible" };
  }

  if (PATIENT_CARE.test(lower)) {
    return {
      lane: "patient_care",
      energyValence,
      invisibleWorkSignal: false,
      scope: "clinical_aggregate",
    };
  }

  return { lane: "general", energyValence, invisibleWorkSignal: false, scope: null };
}

/** Lanes that should be staged to activity_entries for physician confirmation. */
export const STAGEABLE_LANES: MakCaptureLane[] = [
  "career_item",
  "invisible_energy",
  "patient_care",
];
