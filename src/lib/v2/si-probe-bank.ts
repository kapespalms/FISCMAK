/**
 * 6.3: Adaptive SI probe question bank.
 *
 * 8 domains × ~10 questions each = one subjective-insight probe per Mak session.
 * Questions are controlled-vocabulary, open-ended, physician-centered.
 * Mak asks; the physician's response goes to narrative_evidence (PHI-stripped).
 *
 * Rules (from spec):
 * - ~8–12 probes per domain per year (adaptive: more where evidence is thin).
 * - Never re-ask a question already answered (question_index dedup).
 * - Supportive and skippable — never interrogative.
 * - Domain order matches DOMAINS constant (career identity axis, 0–7).
 */

export type SiProbe = {
  domain_index: number;
  question_index: number;
  question: string;
  energy_signal?: "energizing" | "draining" | null;
};

/** DOMAINS: 0=Clinician 1=Educator 2=Researcher 3=Administrator/Leader
 *           4=Advocate 5=Innovator 6=Quality/Safety 7=Wellness Champion */
const PROBE_BANK: SiProbe[] = [
  // 0 — Clinician
  { domain_index: 0, question_index: 0, question: "What part of your clinical work felt most meaningful this week?" },
  { domain_index: 0, question_index: 1, question: "Is there a patient interaction lately that's stayed with you — and why?" },
  { domain_index: 0, question_index: 2, question: "Where in your clinical role do you feel most like yourself?", energy_signal: "energizing" },
  { domain_index: 0, question_index: 3, question: "What clinical work feels increasingly difficult to sustain?", energy_signal: "draining" },
  { domain_index: 0, question_index: 4, question: "If you could change one thing about how you practice, what would it be?" },
  { domain_index: 0, question_index: 5, question: "How has your relationship with your specialty evolved over the past year?" },
  { domain_index: 0, question_index: 6, question: "What clinical skill do you want to deepen that doesn't show on a CV?" },
  { domain_index: 0, question_index: 7, question: "When do you feel your clinical judgment is most trusted?" },
  { domain_index: 0, question_index: 8, question: "What's a case complexity you encounter that rarely gets recognized?" },
  { domain_index: 0, question_index: 9, question: "What would 'thriving clinically' look like for you right now?" },

  // 1 — Educator
  { domain_index: 1, question_index: 0, question: "When did teaching feel most effective recently — what made it work?" },
  { domain_index: 1, question_index: 1, question: "What would you teach if there were no constraints on topic or format?", energy_signal: "energizing" },
  { domain_index: 1, question_index: 2, question: "Is there a learner moment that reminded you why you mentor?" },
  { domain_index: 1, question_index: 3, question: "What part of your educator identity doesn't show up in your formal role?" },
  { domain_index: 1, question_index: 4, question: "What feedback have you given that you're most proud of?" },
  { domain_index: 1, question_index: 5, question: "Where does your teaching feel unrecognized?" },
  { domain_index: 1, question_index: 6, question: "How do you want to grow as an educator over the next 2 years?" },
  { domain_index: 1, question_index: 7, question: "What would a student or trainee say is your biggest teaching gift?" },
  { domain_index: 1, question_index: 8, question: "What curriculum gap do you see that nobody is filling?" },

  // 2 — Researcher
  { domain_index: 2, question_index: 0, question: "What research question keeps coming back to you even when it's not on your agenda?", energy_signal: "energizing" },
  { domain_index: 2, question_index: 1, question: "What research work feels most invisible to your institution?" },
  { domain_index: 2, question_index: 2, question: "Where does your scholarly identity feel most authentic?" },
  { domain_index: 2, question_index: 3, question: "What would you study with a blank grant and no committee?" },
  { domain_index: 2, question_index: 4, question: "What's the gap between the scholarship you produce and the scholarship you want to produce?" },
  { domain_index: 2, question_index: 5, question: "When did you last feel intellectually stretched in a good way?" },
  { domain_index: 2, question_index: 6, question: "What research partnership do you wish existed?" },
  { domain_index: 2, question_index: 7, question: "How do you want your scholarly identity to evolve?" },

  // 3 — Administrator/Leader
  { domain_index: 3, question_index: 0, question: "What leadership work feels most aligned with who you are?", energy_signal: "energizing" },
  { domain_index: 3, question_index: 1, question: "What administrative task do you do that nobody credits?", energy_signal: "draining" },
  { domain_index: 3, question_index: 2, question: "Where does your institutional influence feel most real?" },
  { domain_index: 3, question_index: 3, question: "What would you change about how your department runs if you had full authority?" },
  { domain_index: 3, question_index: 4, question: "What leadership capacity are you building that won't be obvious for years?" },
  { domain_index: 3, question_index: 5, question: "When do you feel like a follower rather than a leader — and what does that bring up?" },
  { domain_index: 3, question_index: 6, question: "What would a future version of your leadership role look like?" },
  { domain_index: 3, question_index: 7, question: "What do you wish your institutional leaders understood about your work?" },

  // 4 — Advocate
  { domain_index: 4, question_index: 0, question: "What inequity in your patients' care weighs on you most?", energy_signal: "draining" },
  { domain_index: 4, question_index: 1, question: "What advocacy work do you do that rarely gets named as such?" },
  { domain_index: 4, question_index: 2, question: "Where do you feel most effective as an advocate — and where least?", energy_signal: "energizing" },
  { domain_index: 4, question_index: 3, question: "What systemic change would you pursue if you had institutional backing?" },
  { domain_index: 4, question_index: 4, question: "What's a policy or practice you've pushed against — even quietly?" },
  { domain_index: 4, question_index: 5, question: "How do you sustain advocacy work without burning out?" },
  { domain_index: 4, question_index: 6, question: "Who are the patients or communities you carry into rooms where they have no voice?" },
  { domain_index: 4, question_index: 7, question: "What would it mean to do this advocacy work in 10 years?" },

  // 5 — Innovator
  { domain_index: 5, question_index: 0, question: "What problem in your practice have you wanted to redesign for years?", energy_signal: "energizing" },
  { domain_index: 5, question_index: 1, question: "What idea do you keep dismissing as 'not my lane' — but keeps returning?" },
  { domain_index: 5, question_index: 2, question: "When did you try something new that didn't get recognized?" },
  { domain_index: 5, question_index: 3, question: "What would you build if the institution said yes?" },
  { domain_index: 5, question_index: 4, question: "How does your innovator identity show up in your day-to-day work?" },
  { domain_index: 5, question_index: 5, question: "What's a process you've quietly improved that nobody knows you improved?" },
  { domain_index: 5, question_index: 6, question: "What technology or tool are you thinking about that others aren't yet?" },

  // 6 — Quality/Safety
  { domain_index: 6, question_index: 0, question: "What quality or safety work are you doing that doesn't show up in your performance review?" },
  { domain_index: 6, question_index: 1, question: "What near-miss or system failure has shaped how you practice?", energy_signal: "draining" },
  { domain_index: 6, question_index: 2, question: "Where does the gap between ideal care and delivered care bother you most?" },
  { domain_index: 6, question_index: 3, question: "What QI project has mattered most to you — and why?" },
  { domain_index: 6, question_index: 4, question: "What safety conversation are you having informally that needs a formal home?" },
  { domain_index: 6, question_index: 5, question: "What quality improvement do you wish your department would prioritize?" },
  { domain_index: 6, question_index: 6, question: "How do you measure your own quality of care in ways the system doesn't?" },

  // 7 — Wellness Champion
  { domain_index: 7, question_index: 0, question: "What are you doing, however small, to protect your own energy?", energy_signal: "energizing" },
  { domain_index: 7, question_index: 1, question: "What part of your work feels most aligned with your values right now?" },
  { domain_index: 7, question_index: 2, question: "What's something you've stopped doing that used to sustain you?", energy_signal: "draining" },
  { domain_index: 7, question_index: 3, question: "How do you know when you're approaching your limit — and what do you do?" },
  { domain_index: 7, question_index: 4, question: "What does professional wellbeing mean to you right now, not in the abstract?" },
  { domain_index: 7, question_index: 5, question: "What would you tell a colleague who was running on empty?" },
  { domain_index: 7, question_index: 6, question: "What boundary have you set or want to set that nobody talks about openly?" },
  { domain_index: 7, question_index: 7, question: "What one thing, if changed, would make the most difference to your sustainability?" },
];

/** Return all probes for a given domain, sorted by question_index. */
export function probesForDomain(domainIndex: number): SiProbe[] {
  return PROBE_BANK.filter((p) => p.domain_index === domainIndex)
    .sort((a, b) => a.question_index - b.question_index);
}

/**
 * Pick the next unanswered probe for a domain.
 * Skips question_indices already in answeredIndices.
 * Returns null if all probes for the domain have been answered.
 */
export function nextProbeForDomain(
  domainIndex: number,
  answeredIndices: number[],
): SiProbe | null {
  const answered = new Set(answeredIndices);
  const available = probesForDomain(domainIndex).filter(
    (p) => !answered.has(p.question_index),
  );
  return available[0] ?? null;
}

/**
 * Pick a probe from the domain with the fewest existing narrative_evidence rows.
 * Falls back to domain 0 if all domains have equal or no evidence.
 * Used by the Mak session to decide which domain to probe next.
 */
export function selectAdaptiveDomain(
  evidenceCountByDomain: Record<number, number>,
): number {
  let minCount = Infinity;
  let targetDomain = 0;
  for (let d = 0; d < 8; d++) {
    const count = evidenceCountByDomain[d] ?? 0;
    if (count < minCount) {
      minCount = count;
      targetDomain = d;
    }
  }
  return targetDomain;
}
