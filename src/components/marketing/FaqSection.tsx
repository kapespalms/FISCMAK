"use client";

import { useState } from "react";

export const FISCMAK_FAQ = [
  {
    id: "q1",
    question: "What makes FISCMAK different from wellness apps or job boards?",
    answer:
      "FISCMAK is a career intelligence platform, not a coaching app or job board. We build longitudinal understanding of your career by analyzing patterns in your everyday work over time.",
  },
  {
    id: "q2",
    question: "How does the longitudinal data model work?",
    answer:
      "Every activity you log becomes data. Over months and years, patterns emerge — career trajectory, burnout signals, and opportunity fit that no single CV snapshot can capture.",
  },
  {
    id: "q3",
    question: "Can you customize FISCMAK for our specific program?",
    answer:
      "Yes. We adapt to your program's specialty, size, and goals — including signal weighting, career pathways, output formats, and integration with existing systems.",
  },
  {
    id: "q4",
    question: "How do you guarantee data privacy and security?",
    answer:
      "Data is encrypted at rest and in transit. Role-based access control ensures only authorized leadership sees aggregated insights. Individual data is private by default.",
  },
  {
    id: "q5",
    question: "What's the onboarding process?",
    answer:
      "Onboarding takes about two minutes: profile, career stage, goals — then start logging activities. Coach Mak provides real-time feedback. No training required.",
  },
  {
    id: "q6",
    question: "Is there a free tier for individual physicians?",
    answer:
      "Yes. Free tier includes basic onboarding, activity logging, and standard outputs. Premium coaching and advanced analytics are available for individual subscribers.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" aria-label="Frequently asked questions" className="px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-futura-bold mb-4 text-4xl text-cx-forest-dark md:text-5xl">
          Frequently Asked
          <br />
          <span className="text-marketing-accent">Questions</span>
        </h2>
        <p className="mb-12 text-lg text-cx-forest-dark/65">
          Common questions about career intelligence, privacy, and getting started.
        </p>

        <div className="space-y-4">
          {FISCMAK_FAQ.map((faq) => {
            const open = openId === faq.id;
            return (
              <div key={faq.id} className="overflow-hidden rounded-lg bg-marketing-accent">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/90"
                  aria-expanded={open}
                >
                  <span className="font-futura-medium pr-4 text-lg text-black">{faq.question}</span>
                  <span className="font-futura-bold shrink-0 text-2xl text-black">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="border-t-4 border-black bg-gray-900 p-6 text-sm leading-relaxed text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
