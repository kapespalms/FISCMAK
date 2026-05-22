/** @deprecated Prefer /api/v1/templates + promotion dossier prefill for V2 outputs. */
import { NextResponse } from "next/server";

const PLACEHOLDERS: Record<string, string> = {
  cv_bullets: `1. Led curriculum redesign for emergency medicine residency, increasing first-attempt board pass rate by 12% over two years.
2. Mentored 8 junior physicians in clinical decision-making, with 100% advancement to leadership roles within 3 years.
3. Developed simulation-based training program adopted across 3 institutions (150+ residents annually).
4. Published 8 peer-reviewed manuscripts on physician well-being and clinical education.
5. Established quality improvement initiative reducing length of stay by 18% while improving satisfaction scores by 25%.`,
  annual_review: `This year I deepened my work as a clinician-educator while taking on informal systems leadership. My most meaningful contributions centered on learner development and curriculum innovation...`,
  career_snapshot: `I am a clinician-educator committed to developing the next generation of physicians through evidence-based teaching and systems-aware clinical practice.`,
};

export async function POST(request: Request) {
  const { templateType } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Generate a ${templateType} document for a physician based on demo career evidence. Professional tone. Follow FISCMAK template conventions.`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text =
          data.content?.find((b: { type: string }) => b.type === "text")?.text;
        if (text) return NextResponse.json({ content: text });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return NextResponse.json({
    content:
      PLACEHOLDERS[templateType as string] ??
      `Demo ${templateType} content. Add ANTHROPIC_API_KEY for Claude generation.`,
  });
}
