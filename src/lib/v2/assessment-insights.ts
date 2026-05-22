import type { AppUser, CareerAssessment, DocumentRecord } from "@/lib/v2/types";
import { getGloballyAnsweredIds, getPendingQuestions } from "@/lib/v2/conversational-assessment";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { TOUCHPOINT_META, computeAssessmentScore } from "@/lib/v2/formulas";
import { questionsForTouchpoint, QUESTION_BANK } from "@/lib/v2/question-bank";

export type TouchpointInsight = {
  number: number;
  title: string;
  category: string;
  status: "not_started" | "in_progress" | "complete";
  score: number | null;
  coverage_pct: number;
  collected_signals: { label: string; value: string }[];
  insights: string[];
};

export type AssessmentInsights = {
  career_pattern: { label: string; narrative: string };
  touchpoints: TouchpointInsight[];
  strengths: { domain: string; note: string; status: "strength" | "opportunity" | "risk" }[];
  recognition_gaps: {
    domain: string;
    from_conversation: string;
    documented_on_cv: string;
    gap_level: "high" | "medium" | "low";
  }[];
  coherence_score: number | null;
  coherence_label: string;
  s_index: number | null;
  iwq: number | null;
  conversation_coverage_pct: number;
  mak_suggested_opener: string;
};

function answerMap(assessments: CareerAssessment[]): Map<string, string | number> {
  const m = new Map<string, string | number>();
  for (const a of assessments) {
    for (const q of a.questions_answered) {
      m.set(q.q_id, q.answer);
    }
  }
  return m;
}

function str(v: string | number | undefined): string {
  if (v == null) return "";
  return String(v);
}

function inferCareerPattern(
  user: AppUser,
  answers: Map<string, string | number>,
): { label: string; narrative: string } {
  const track = str(answers.get("Q1.2")) || "Clinician-Educator";
  const domain =
    str(answers.get("Q1.6")) ||
    (user.specialty?.toLowerCase().includes("surgery") ? "Clinical" : "Teaching");
  const identity = str(answers.get("Q1.3"));
  const goal = str(answers.get("Q1.4"));

  let label = track;
  if (answers.get("Q3.1") && Number(answers.get("Q3.1")) >= 4) {
    label = `${track} with Burnout Risk Signals`;
  } else if (str(answers.get("Q2.5")).length > 20) {
    label = `${track} with Emerging Systems Leadership`;
  }

  const narrative = [
    identity ? `Identity: ${identity}` : null,
    goal ? `Direction: ${goal}` : null,
    user.specialty ? `${user.specialty} · ${user.career_stage ?? "career stage pending"}` : null,
    `Primary domain signal: ${domain}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return { label, narrative: narrative || "Continue your conversation with Coach Mak to sharpen this pattern." };
}

function signalsForTouchpoint(
  tp: number,
  answers: Map<string, string | number>,
): { label: string; value: string }[] {
  const qs = questionsForTouchpoint(tp);
  return qs
    .filter((q) => answers.has(q.q_id))
    .map((q) => ({
      label: q.question.replace(/\s*\(1-5.*\)$/, "").slice(0, 48),
      value: str(answers.get(q.q_id)).slice(0, 120),
    }))
    .slice(0, 5);
}

function insightsForTouchpoint(
  tp: number,
  answers: Map<string, string | number>,
  status: TouchpointInsight["status"],
): string[] {
  if (status === "not_started") {
    return ["Coach Mak will explore this naturally in conversation — no forms required."];
  }

  const lines: string[] = [];
  if (tp === 1) {
    if (answers.get("Q1.4")) lines.push(`Career goal captured: ${str(answers.get("Q1.4")).slice(0, 100)}`);
    if (answers.get("Q1.7")) lines.push(`Mentorship status: ${answers.get("Q1.7")}`);
    if (answers.get("Q1.5")) lines.push(`Career clarity rated ${answers.get("Q1.5")}/5`);
  }
  if (tp === 2) {
    if (answers.get("Q2.1")) lines.push("Teaching impact documented from conversation.");
    if (answers.get("Q2.5")) lines.push("Committee/service load identified.");
    if (answers.get("Q2.6")) lines.push("Non-billable work surfaced — potential invisible work.");
  }
  if (tp === 3) {
    const exhaustion = Number(answers.get("Q3.1"));
    if (!Number.isNaN(exhaustion)) {
      lines.push(
        exhaustion >= 4
          ? "Elevated exhaustion signal — worth discussing energy with Mak."
          : "Energy/burnout baseline captured.",
      );
    }
    if (answers.get("Q3.6")) lines.push(`Uncompensated service: ~${answers.get("Q3.6")} hrs/month noted.`);
  }
  if (tp === 5 && answers.get("Q5.5")) {
    lines.push(`Strongest promotion domain: ${answers.get("Q5.5")}`);
    if (answers.get("Q5.6")) lines.push(`Development priority: ${answers.get("Q5.6")}`);
  }

  if (lines.length === 0) {
    lines.push("Partial signals collected — keep talking with Mak to deepen this touchpoint.");
  }
  return lines;
}

function buildStrengths(
  answers: Map<string, string | number>,
  cvMetrics: ReturnType<typeof computeCvMetrics> | null,
): AssessmentInsights["strengths"] {
  const items: AssessmentInsights["strengths"] = [];

  if (cvMetrics) {
    for (const [domain, score] of Object.entries(cvMetrics.domain_scores)) {
      items.push({
        domain: domain.charAt(0).toUpperCase() + domain.slice(1),
        note:
          score >= 60
            ? "Strong CV evidence in this domain."
            : "Limited CV documentation — conversation may reveal more.",
        status: score >= 60 ? "strength" : "opportunity",
      });
    }
    if (cvMetrics.iwq >= 50) {
      items.push({
        domain: "Invisible work",
        note: cvMetrics.interpretation.iwq,
        status: "risk",
      });
    }
  }

  if (answers.get("Q5.5")) {
    items.push({
      domain: String(answers.get("Q5.5")),
      note: "Self-identified promotion strength from coaching conversation.",
      status: "strength",
    });
  }
  if (answers.get("Q5.6")) {
    items.push({
      domain: String(answers.get("Q5.6")),
      note: "Growth area to address in Plan and Output Studio.",
      status: "opportunity",
    });
  }

  if (items.length === 0) {
    items.push({
      domain: "Getting started",
      note: "Talk with Coach Mak about your career — insights appear here automatically.",
      status: "opportunity",
    });
  }

  return items.slice(0, 6);
}

function buildRecognitionGaps(
  answers: Map<string, string | number>,
  cvMetrics: ReturnType<typeof computeCvMetrics> | null,
): AssessmentInsights["recognition_gaps"] {
  if (!cvMetrics) {
    return [
      {
        domain: "CV",
        from_conversation: "Conversation data available",
        documented_on_cv: "Upload CV for gap analysis",
        gap_level: "medium",
      },
    ];
  }

  const gaps: AssessmentInsights["recognition_gaps"] = [];
  const teachingConv = str(answers.get("Q2.1")) || str(answers.get("Q2.2"));
  const serviceConv = str(answers.get("Q2.5")) || str(answers.get("Q2.6"));

  if (teachingConv && cvMetrics.domain_scores.teaching < 40) {
    gaps.push({
      domain: "Teaching",
      from_conversation: teachingConv.slice(0, 80),
      documented_on_cv: "Sparse on CV",
      gap_level: "high",
    });
  }
  if (serviceConv && cvMetrics.domain_scores.service < 50) {
    gaps.push({
      domain: "Service/Leadership",
      from_conversation: serviceConv.slice(0, 80),
      documented_on_cv: "Under-documented",
      gap_level: "high",
    });
  }
  if (cvMetrics.evidence.invisible_work_signals.length > 0) {
    gaps.push({
      domain: "Invisible work",
      from_conversation: cvMetrics.evidence.invisible_work_signals.join(", "),
      documented_on_cv: "Partially visible on CV",
      gap_level: cvMetrics.iwq >= 50 ? "high" : "medium",
    });
  }

  if (gaps.length === 0) {
    gaps.push({
      domain: "Documentation",
      from_conversation: "Coaching signals aligned with CV",
      documented_on_cv: "Reasonably documented",
      gap_level: "low",
    });
  }
  return gaps;
}

function coherenceFromData(
  assessments: CareerAssessment[],
  cvMetrics: ReturnType<typeof computeCvMetrics> | null,
): { score: number | null; label: string } {
  const completed = assessments.filter((a) => a.completed_at).length;
  const totalAnswered = getGloballyAnsweredIds(assessments).length;
  const totalQuestions = QUESTION_BANK.length;

  if (totalAnswered === 0 && !cvMetrics) {
    return { score: null, label: "Talk with Coach Mak to establish your career pattern." };
  }

  const coverage = totalAnswered / totalQuestions;
  const cvAlign = cvMetrics ? cvMetrics.promotion_aligned_pct / 100 : 0.5;
  const tpProgress = completed / 7;
  const score = Math.round((coverage * 0.4 + cvAlign * 0.35 + tpProgress * 0.25) * 100);

  let label = "Somewhat scattered — keep conversing with Mak to unify your narrative.";
  if (score >= 80) label = "Highly coherent — your work tells a unified story.";
  else if (score >= 60) label = "Coherent with a few gaps to explore.";
  else if (score >= 40) label = "Emerging pattern — more conversation will sharpen it.";

  return { score, label };
}

export function buildAssessmentInsights(input: {
  user: AppUser;
  assessments: CareerAssessment[];
  documents: DocumentRecord[];
}): AssessmentInsights {
  const { user, assessments, documents } = input;
  const answers = answerMap(assessments);
  const cv = documents.find((d) => d.document_type === "CV" && d.extracted_text);
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, assessments) : null;
  const globalAnswered = getGloballyAnsweredIds(assessments);

  const touchpoints: TouchpointInsight[] = [1, 2, 3, 4, 5, 6, 7].map((tp) => {
    const meta = TOUCHPOINT_META[tp];
    const total = questionsForTouchpoint(tp).length;
    const answeredInTp = questionsForTouchpoint(tp).filter((q) =>
      globalAnswered.includes(q.q_id),
    ).length;
    const record = assessments.find((a) => a.touchpoint_number === tp);
    const coverage_pct = total > 0 ? Math.round((answeredInTp / total) * 100) : 0;

    let status: TouchpointInsight["status"] = "not_started";
    if (record?.completed_at || answeredInTp >= total) status = "complete";
    else if (answeredInTp > 0) status = "in_progress";

    const score =
      record?.score ??
      (answeredInTp > 0
        ? computeAssessmentScore(
            questionsForTouchpoint(tp)
              .filter((q) => answers.has(q.q_id))
              .map((q) => ({ answer: answers.get(q.q_id)! })),
          )
        : null);

    return {
      number: tp,
      title: meta?.title ?? `Touchpoint ${tp}`,
      category: meta?.category ?? "",
      status,
      score,
      coverage_pct,
      collected_signals: signalsForTouchpoint(tp, answers),
      insights: insightsForTouchpoint(tp, answers, status),
    };
  });

  const pendingTotal = [1, 2, 3, 4, 5, 6, 7].reduce(
    (sum, tp) => sum + getPendingQuestions(tp, assessments).length,
    0,
  );
  const conversation_coverage_pct = Math.round(
    ((QUESTION_BANK.length - pendingTotal) / QUESTION_BANK.length) * 100,
  );

  const pattern = inferCareerPattern(user, answers);
  const coherence = coherenceFromData(assessments, cvMetrics);

  const nextPendingTp = touchpoints.find((t) => t.status !== "complete");

  return {
    career_pattern: pattern,
    touchpoints,
    strengths: buildStrengths(answers, cvMetrics),
    recognition_gaps: buildRecognitionGaps(answers, cvMetrics),
    coherence_score: coherence.score,
    coherence_label: coherence.label,
    s_index: cvMetrics?.s_index ?? null,
    iwq: cvMetrics?.iwq ?? null,
    conversation_coverage_pct,
    mak_suggested_opener: nextPendingTp
      ? `Let's explore ${nextPendingTp.title.toLowerCase()} — tell me what's been most true for you lately.`
      : "Your touchpoint picture is filling in. What pattern or gap should we dig into next?",
  };
}
