"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { ConnectWithFiscmakHeading } from "@/components/marketing/ConnectWithFiscmakHeading";
import { cn } from "@/lib/utils";

type FormState = "idle" | "success" | "error";

export function ContactFormCard({ className }: { className?: string }) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormState("idle");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const question = String(data.get("question") ?? "").trim();

    if (!name || !email || !question || !email.includes("@")) {
      setFormState("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question }),
      });

      if (!response.ok) {
        setFormState("error");
        return;
      }

      setFormState("success");
      form.reset();
    } catch {
      setFormState("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-[16rem] rounded-2xl bg-[#1a2419] px-4 py-5 sm:max-w-[17.5rem]",
        className,
      )}
    >
      <ConnectWithFiscmakHeading size="xs" />

      <p className="font-futura-condensed mt-2 text-[10px] leading-snug text-white/90 sm:text-[11px]">
        Your inquiries, ideas, and collaboration opportunities are just a click away.
        Let&apos;s start the conversation.
      </p>

      {formState === "success" ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#d4f5c4] px-3 py-2.5 text-[#1a2419]">
          <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden />
          <p className="font-futura-medium text-[10px] leading-snug sm:text-[11px]">
            Successfully submitted. Stay tuned.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <div>
            <label htmlFor="contact-name" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Full Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Coach Mak"
              className="w-full rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Coach.Mak@hospital.org"
              className="w-full rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <div>
            <label htmlFor="contact-question" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Question
            </label>
            <textarea
              id="contact-question"
              name="question"
              required
              rows={2}
              placeholder="How can we help you?"
              className="w-full resize-none rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-futura-bold rounded-lg bg-marketing-accent px-3 py-2 text-[10px] text-black transition hover:bg-white disabled:opacity-60 sm:text-[11px]"
          >
            {loading ? "Sending…" : "Send a Question"}
          </button>

          {formState === "error" && (
            <div className="rounded-lg bg-[#f5d4c4] px-3 py-2 text-[10px] leading-snug text-[#1a2419] sm:text-[11px]">
              Oops, something went wrong! Please double-check your submission and try again.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
