import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchAssessments } from "@/lib/v2/db";
import {
  extractAnswersFromMessage,
  getPendingQuestions,
  questionById,
  seedAnswersFromProfile,
  type ExtractedAnswer,
} from "@/lib/v2/conversational-assessment";
import { computeAssessmentScore } from "@/lib/v2/formulas";
import { questionsForTouchpoint } from "@/lib/v2/question-bank";
import type { AppUser, AssessmentAnswer, CareerAssessment } from "@/lib/v2/types";

export async function ensureTouchpointAssessment(
  userId: string,
  demo: boolean,
  touchpoint: number,
  category: string,
): Promise<CareerAssessment> {
  const all = await fetchAssessments(userId, demo);
  const existing = all.find((a) => a.touchpoint_number === touchpoint && !a.completed_at);
  if (existing) return existing;

  const row: CareerAssessment = {
    assessment_id: crypto.randomUUID(),
    user_id: userId,
    touchpoint_number: touchpoint,
    question_category: category,
    questions_answered: [],
    score: null,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  if (demo) {
    getServerDemo(userId).assessments.push(row);
  } else {
    const supabase = await createClient();
    await supabase.from("career_assessments").insert(row);
  }
  return row;
}

function mergeAnswer(
  assessment: CareerAssessment,
  qId: string,
  answer: string | number,
): AssessmentAnswer {
  const def = questionById(qId);
  return {
    q_id: qId,
    question: def?.question ?? qId,
    answer,
    timestamp: new Date().toISOString(),
  };
}

export async function applyExtractedAnswers(
  userId: string,
  demo: boolean,
  assessment: CareerAssessment,
  answers: ExtractedAnswer[],
): Promise<{ applied: string[]; completed: boolean }> {
  const applied: string[] = [];
  let current = assessment;

  for (const { q_id, answer } of answers) {
    if (current.questions_answered.some((q) => q.q_id === q_id)) continue;
    const entry = mergeAnswer(current, q_id, answer);
    current = {
      ...current,
      questions_answered: [...current.questions_answered.filter((q) => q.q_id !== q_id), entry],
    };
    applied.push(q_id);
  }

  const total = questionsForTouchpoint(current.touchpoint_number).length;
  const done = current.questions_answered.length >= total;
  if (done) {
    current = {
      ...current,
      completed_at: new Date().toISOString(),
      score: computeAssessmentScore(current.questions_answered),
    };
  }

  if (demo) {
    const state = getServerDemo(userId);
    const i = state.assessments.findIndex((a) => a.assessment_id === current.assessment_id);
    if (i >= 0) state.assessments[i] = current;
  } else {
    const supabase = await createClient();
    await supabase
      .from("career_assessments")
      .update({
        questions_answered: current.questions_answered,
        completed_at: current.completed_at,
        score: current.score,
      })
      .eq("assessment_id", current.assessment_id);
  }

  return { applied, completed: done };
}

export async function processConversationalTurn(
  user: AppUser,
  userId: string,
  demo: boolean,
  message: string,
  touchpoint = 1,
): Promise<{
  autoAnswered: string[];
  pendingCount: number;
  touchpointComplete: boolean;
}> {
  const all = await fetchAssessments(userId, demo);
  let assessment = await ensureTouchpointAssessment(
    userId,
    demo,
    touchpoint,
    touchpoint === 1 ? "INTRO" : "INVENTORY",
  );

  const profileSeeds = seedAnswersFromProfile(user).filter(
    (s) => !all.some((a) => a.questions_answered.some((q) => q.q_id === s.q_id)),
  );
  if (profileSeeds.length > 0) {
    await applyExtractedAnswers(userId, demo, assessment, profileSeeds);
    assessment =
      (await fetchAssessments(userId, demo)).find(
        (a) => a.assessment_id === assessment.assessment_id,
      ) ?? assessment;
  }

  const refreshed = await fetchAssessments(userId, demo);
  const pending = getPendingQuestions(touchpoint, refreshed);
  const extracted = extractAnswersFromMessage(message, pending, user);
  const { applied, completed } = await applyExtractedAnswers(
    userId,
    demo,
    assessment,
    extracted,
  );

  const after = await fetchAssessments(userId, demo);
  const pendingAfter = getPendingQuestions(touchpoint, after);

  return {
    autoAnswered: applied,
    pendingCount: pendingAfter.length,
    touchpointComplete: completed,
  };
}
