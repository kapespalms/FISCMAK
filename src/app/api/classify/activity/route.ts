/** @deprecated Use V2 assessment engine — V1 activity classification retained for legacy Objective workspace. */
import { classifyActivityFallback } from "@/lib/classify";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text, careerPhase, specialty } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Classify physician activity. Return JSON: primary_domain, primary_track, primary_domain_confidence, primary_track_confidence, scope, evidence_strength, confidence_score, rationale. Domains: Clinical Expertise, Medical Knowledge, Practice-Based Learning, Communication, Professionalism & Ethics, Systems Thinking, Collaboration & Teamwork, Personal & Professional Development. Tracks: Clinician, Educator, Researcher, Administrator/Leader, Advocate, Innovator, Quality/Safety, Wellness Champion.`,
            },
            {
              role: "user",
              content: `Activity: ${text}\nCareer phase: ${careerPhase ?? "unknown"}\nSpecialty: ${specialty ?? "unknown"}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          return NextResponse.json(parsed);
        }
      }
    } catch (e) {
      console.error("OpenAI classify error:", e);
    }
  }

  return NextResponse.json(classifyActivityFallback(text));
}
