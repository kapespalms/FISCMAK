"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { QuestionDef } from "@/lib/v2/types";
import { TOUCHPOINT_META } from "@/lib/v2/formulas";

export function AssessmentWizard() {
  const [touchpoint, setTouchpoint] = useState(1);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionDef | null>(null);
  const [answer, setAnswer] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);

  const loadCurrent = useCallback(async () => {
    const res = await fetch("/api/v1/assessments/current");
    const data = await res.json();
    if (data.all_answered) {
      setConversationComplete(true);
      setQuestion(null);
      setAssessmentId(data.assessment_id);
      return;
    }
    setConversationComplete(false);
    if (data.assessment_id) {
      setAssessmentId(data.assessment_id);
      setTouchpoint(data.touchpoint_number);
      setQuestion(data.questions?.[0] ?? null);
      setProgress({
        current: data.progress?.current_question ?? 1,
        total: data.progress?.total_questions ?? 1,
      });
    }
  }, []);

  useEffect(() => {
    void loadCurrent();
  }, [loadCurrent]);

  async function startAssessment(tp: number) {
    setLoading(true);
    const res = await fetch("/api/v1/assessments/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ touchpoint_number: tp }),
    });
    const data = await res.json();
    setAssessmentId(data.assessment_id);
    setTouchpoint(tp);
    setComplete(false);
    setScore(null);
    await loadCurrent();
    setLoading(false);
  }

  async function submitAnswer() {
    if (!assessmentId || !question || !answer.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/v1/assessments/${assessmentId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q_id: question.q_id, answer: answer.trim() }),
    });
    const data = await res.json();
    if (data.next_question) {
      setQuestion(data.next_question);
      setAnswer("");
      setProgress((p) => ({ ...p, current: p.current + 1 }));
    } else {
      const done = await fetch(`/api/v1/assessments/${assessmentId}/complete`, {
        method: "POST",
      });
      const result = await done.json();
      setComplete(true);
      setScore(result.score);
      setQuestion(null);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Career assessments</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          7 touchpoints over 3 months. Coach Mak captures many answers in conversation — forms
          only show what&apos;s still missing.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-7">
        {[1, 2, 3, 4, 5, 6, 7].map((tp) => (
          <button
            key={tp}
            type="button"
            onClick={() => startAssessment(tp)}
            className={`rounded-lg border px-2 py-2 text-center text-xs ${
              touchpoint === tp
                ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                : "border-fiscmak-border hover:bg-fiscmak-subtle"
            }`}
          >
            TP{tp}
            <span className="mt-0.5 block truncate text-[10px] text-fiscmak-muted">
              {TOUCHPOINT_META[tp]?.title.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {conversationComplete ? (
        <Card accent="green">
          <h2 className="font-semibold">Already covered with Coach Mak</h2>
          <p className="mt-2 text-sm text-fiscmak-muted">
            This touchpoint was answered in your onboarding conversation. Continue chatting with Mak
            for the next topics, or pick another touchpoint above.
          </p>
        </Card>
      ) : complete && score != null ? (
        <Card accent="green">
          <h2 className="font-semibold">Touchpoint {touchpoint} complete</h2>
          <p className="mt-2 text-3xl font-bold text-fiscmak-green">{score}</p>
          <p className="mt-1 text-sm text-fiscmak-muted">Career health score for this touchpoint</p>
          <Button className="mt-4" onClick={() => startAssessment(Math.min(touchpoint + 1, 7))}>
            Next touchpoint
          </Button>
        </Card>
      ) : question ? (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">
            Touchpoint {touchpoint} · Question {progress.current} of {progress.total}
          </p>
          <h2 className="mt-2 text-lg font-semibold">{question.question}</h2>
          {question.question_type === "choice" && question.options ? (
            <div className="mt-4 space-y-2">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswer(opt)}
                  className={`block w-full rounded-lg border px-4 py-2 text-left ${
                    answer === opt ? "border-fiscmak-green bg-fiscmak-green-light" : "border-fiscmak-border"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : question.question_type === "likert" ? (
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAnswer(String(n))}
                  className={`h-10 w-10 rounded-full border ${
                    answer === String(n) ? "border-fiscmak-green bg-fiscmak-green" : "border-fiscmak-border"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="mt-4 w-full rounded-lg border border-fiscmak-border p-3 text-sm"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer…"
            />
          )}
          <Button className="mt-4" onClick={submitAnswer} disabled={loading || !answer}>
            {loading ? "Saving…" : "Continue"}
          </Button>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-fiscmak-muted">Select a touchpoint above to begin or continue.</p>
          <Button className="mt-4" onClick={() => startAssessment(1)} disabled={loading}>
            Start touchpoint 1
          </Button>
        </Card>
      )}
    </div>
  );
}
