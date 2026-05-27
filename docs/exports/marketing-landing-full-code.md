# FISCMAK Marketing Landing Page — Full Code Bundle

Exported: 2026-05-25T04:29:45.039Z


---

## src/app/page.tsx

```tsx
import { MarketingHomePage } from "@/components/marketing/MarketingHomePage";

export default function Home() {
  return <MarketingHomePage />;
}
```

---

## src/components/marketing/MarketingHomePage.tsx

```tsx
import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { FiscmakNameSection } from "@/components/marketing/FiscmakNameSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingHomePage() {
  return (
    <MarketingFontShell className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <div className="relative bg-black">
        <MarketingHeader overlay />
        <main id="main-content">
          <MarketingHeroSection />
        </main>
      </div>

      <FiscmakNameSection />
      <HowItWorksSection />
      <MarketingFooter />
    </MarketingFontShell>
  );
}
```

---

## src/components/marketing/MarketingHeader.tsx

```tsx
import Link from "next/link";

const navigationItems = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative" },
  { label: "Institutions", href: "/institutions" },
];

type MarketingHeaderProps = {
  overlay?: boolean;
};

export function MarketingHeader({ overlay = false }: MarketingHeaderProps) {
  return (
    <header
      className={
        overlay
          ? "absolute left-0 right-0 top-0 z-20 overflow-visible bg-transparent"
          : "relative sticky top-0 z-50 overflow-visible border-b border-white/10 bg-black/80 backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center lg:flex"
      >
        <div className="pointer-events-auto flex items-center gap-8">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-futura-condensed text-base text-white transition hover:text-marketing-accent"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between px-8 py-6 md:px-10">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="relative z-10 shrink-0 font-futura-bold text-4xl tracking-wide md:text-5xl"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <div className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-4">
          <Link
            href="/login"
            className="font-futura-bold hidden rounded border border-marketing-accent px-6 py-2.5 text-sm text-white transition hover:bg-marketing-accent hover:text-black sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/app/onboarding"
            className="font-futura-bold rounded bg-marketing-accent px-6 py-2.5 text-sm text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
```

---

## src/components/marketing/MarketingHeroSection.tsx

```tsx
function HeroTagline({
  verb,
  middle,
  end,
}: {
  verb: string;
  middle: string;
  end: string;
}) {
  return (
    <p className="font-futura-condensed whitespace-nowrap text-base md:text-lg lg:text-xl">
      <span className="text-marketing-accent">{verb}</span>{" "}
      <span className="text-white">{middle}</span>{" "}
      <span className="text-marketing-gold">{end}</span>
    </p>
  );
}

export function MarketingHeroSection() {
  return (
    <section
      id="hero-value-proposition"
      aria-label="Hero value proposition"
      className="relative flex min-h-[min(720px,85svh)] items-start justify-start px-8 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36 lg:px-16 lg:pt-40"
    >
      <div className="relative w-full max-w-6xl">
        <div className="inline-grid grid-cols-[auto_auto_auto] gap-x-[0.35em] text-4xl uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]">
          <h1 className="contents font-futura-bold">
            <span className="col-start-1 row-start-1">What</span>
            <span className="col-start-2 row-start-1">move</span>
            <span className="col-start-3 row-start-1 text-marketing-accent">honors</span>
            <span className="col-start-2 row-start-2">your</span>
            <span className="col-start-3 row-start-2">work?</span>
          </h1>
          <p className="col-start-2 col-span-2 row-start-3 mt-3 max-w-md font-futura-condensed text-base normal-case tracking-normal text-white md:mt-4 md:text-lg lg:text-xl">
            An intelligent career platform for physicians.
          </p>
          <div className="col-start-2 col-span-2 row-start-4 mt-5 flex flex-col gap-2 md:mt-6 md:flex-row md:flex-wrap md:gap-x-8 lg:gap-x-10">
            <HeroTagline verb="Capture" middle="the" end="invisible." />
            <HeroTagline verb="Clarify" middle="your" end="direction." />
            <HeroTagline verb="Build" middle="the career" end="you want." />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## src/components/marketing/FiscmakNameSection.tsx

```tsx
import Link from "next/link";

type FiscmakNameIntroProps = {
  id?: string;
};

export function FiscmakNameIntro({ id }: FiscmakNameIntroProps) {
  return (
    <section id={id} className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold text-5xl text-white md:text-7xl lg:text-8xl">
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </h2>

        <p className="font-futura-bold mt-6 text-xl md:text-2xl">
          <span className="text-marketing-accent">PRONOUNCED: </span>
          <span className="text-marketing-accent">[ </span>
          <span className="text-white">FIZ-MAK</span>
          <span className="text-marketing-accent"> ]</span>
        </p>

        <p className="font-futura-condensed mt-5 max-w-3xl text-base text-white md:text-lg">
          By the standard rules of grammar, you should pronounce the C in FISC.
        </p>
        <p className="font-futura-bold mt-2 text-base text-marketing-accent md:text-lg">
          We don&apos;t follow the rules here.
        </p>
      </div>
    </section>
  );
}

export function FiscmakNameBreakdown() {
  return (
    <section className="px-6 pb-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              FISC
              <br />
              <span className="text-marketing-accent">THE HIDDEN TREASURY</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Derived from <em>fiscus</em>, a &quot;fisc&quot; is used to store an empire&apos;s most
              valuable treasures.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              In medicine, expertise, dedication, and time are the ultimate assets.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              THE SILENT &apos;C&apos;
              <br />
              <span className="text-marketing-accent">THE INVISIBLE WORK</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Represents the amount of invisible work doctors perform every day.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              It stands for the hours spent navigating clunky systems, charting, and battling friction
              in silence.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              MAK
              <br />
              <span className="text-marketing-accent">THE HIGHEST STANDARD</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">Rooted in the name Maximus.</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              &quot;MAK&quot; stands for the highest possible standard of excellence and autonomy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FoundersNarrativeSection() {
  return (
    <section id="our-narrative" className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-8 text-4xl text-white md:text-5xl">
          Founders&apos; Narrative
        </h2>
        <div className="space-y-6 leading-relaxed text-gray-400">
          <p>
            We built FISCMAK because we saw the same pattern over and over: brilliant physicians doing
            invisible work.
          </p>
          <p>
            The teaching happens but isn&apos;t documented. The mentorship exists but isn&apos;t
            recognized. The emotional labor sustains entire programs but never appears in career
            advancement decisions.
          </p>
          <p>
            We started with a simple question:{" "}
            <span className="font-futura-medium text-marketing-accent">
              What if every activity a physician logs becomes insight about their career trajectory?
            </span>
          </p>
          <p>
            Not coaching. Not job boards. Not wellness tools.{" "}
            <span className="font-futura-medium text-marketing-accent">Career intelligence.</span>
          </p>
          <p>Longitudinal understanding. Pattern recognition. Opportunity mobility.</p>
          <p className="italic">
            FISCMAK is our attempt to make invisible work visible, to honor the treasures physicians
            carry, and to build the career clarity they deserve.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/app/onboarding"
            className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FiscmakNameSection() {
  return (
    <>
      <FiscmakNameIntro id="about-fiscmak" />
      <FiscmakNameBreakdown />
    </>
  );
}

export function AboutFiscmakContent() {
  return (
    <>
      <FiscmakNameIntro />
      <FiscmakNameBreakdown />
    </>
  );
}
```

---

## src/components/marketing/HowItWorksSection.tsx

```tsx
export function HowItWorksSection() {
  const steps = [
    {
      n: 1,
      title: "Log Activity",
      body: 'Describe your work: "I mentored a junior resident in clinical decision-making."',
    },
    {
      n: 2,
      title: "Detect Signals",
      body: "Coach Mak analyzes mentorship, teaching, leadership, energy, and development signals.",
    },
    {
      n: 3,
      title: "Generate Evidence",
      body: "Auto-generated CV bullets, promotion language, and annual review narratives.",
    },
    {
      n: 4,
      title: "Predict Next",
      body: "Opportunity recommendations based on your trajectory and emerging patterns.",
    },
  ];

  return (
    <section id="how-it-works" aria-label="How FISCMAK works" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-12 text-4xl text-white md:text-5xl">
          How <span className="text-marketing-accent">FISCMAK</span> Works
        </h2>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-lg border-l-4 border-marketing-accent bg-gray-900 p-6"
            >
              <div className="mb-4 flex items-center">
                <div className="font-futura-bold mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-marketing-accent text-black">
                  {step.n}
                </div>
                <h3 className="font-futura-bold text-xl text-white">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 rounded-lg border-l-4 border-marketing-accent bg-gray-900 p-8">
          <h3 className="font-futura-bold mb-6 text-2xl text-white">Why It Matters</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">For Physicians</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Career clarity</li>
                <li>Professional outputs</li>
                <li>Burnout detection</li>
                <li>Job matching</li>
              </ul>
            </div>
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">For Programs</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Retention ↑ 5–10%</li>
                <li>Burnout detection ↑ 65%</li>
                <li>Attrition ↓ 40%</li>
                <li>21× ROI</li>
              </ul>
            </div>
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">Longitudinal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Month 6: patterns emerge</li>
                <li>Month 12: predict next moves</li>
                <li>Month 24: own your trajectory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## src/components/marketing/MarketingFooter.tsx

```tsx
import Link from "next/link";
import { ContactFormCard } from "@/components/marketing/ContactFormCard";

const footerLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative", external: true },
  { label: "Institutions", href: "/institutions", isLink: true },
  { label: "FAQ", href: "/faq", isLink: true },
  { label: "Sign In", href: "/login", isLink: true },
] as const;

export function MarketingFooter() {
  return (
    <footer id="contact" aria-label="Footer navigation" className="overflow-visible bg-black">
      <div className="px-6 pb-10 pt-12 sm:pl-[12%] md:px-10 md:pl-[20%] md:pb-12 md:pt-16">
        <ContactFormCard />
      </div>

      <div className="border-t border-white/20" aria-hidden />

      <div className="px-6 py-10 md:px-10 md:py-12">
        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400"
        >
          {footerLinks.map((item) =>
            item.external ? (
              <Link key={item.label} href={item.href} className="hover:text-marketing-accent">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="hover:text-marketing-accent">
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="mt-10 flex items-end justify-between gap-6">
          <Link
            href="/"
            aria-label="FISCMAK home"
            className="font-futura-bold text-2xl tracking-wide md:text-3xl"
          >
            <span className="text-[#f1fbe7]">FISC</span>
            <span className="text-marketing-accent">MAK</span>
          </Link>

          <p className="font-futura-condensed text-sm text-gray-500">
            © {new Date().getFullYear()} FISCMAK
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## src/components/marketing/ContactFormCard.tsx

```tsx
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
```

---

## src/components/marketing/ConnectWithFiscmakHeading.tsx

```tsx
import { cn } from "@/lib/utils";

type ConnectWithFiscmakHeadingProps = {
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  size?: "xs" | "sm" | "md" | "lg";
};

const sizeClass = {
  xs: "text-base whitespace-nowrap md:text-lg",
  sm: "text-sm tracking-[0.2em] whitespace-nowrap",
  md: "text-3xl whitespace-nowrap md:text-4xl lg:text-5xl",
  lg: "text-4xl whitespace-nowrap md:text-5xl lg:text-6xl",
};

export function ConnectWithFiscmakHeading({
  className,
  as: Tag = "h2",
  size = "md",
}: ConnectWithFiscmakHeadingProps) {
  return (
    <Tag className={cn("font-futura-bold uppercase leading-tight", sizeClass[size], className)}>
      <span className="text-white">Connect with FISC</span>
      <span className="text-marketing-accent">MAK</span>
    </Tag>
  );
}
```

---

## src/components/marketing/MarketingFontShell.tsx

```tsx
import { marketingFontVariables } from "@/lib/fonts/marketing-fonts";
import { cn } from "@/lib/utils";

export function MarketingFontShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-page", marketingFontVariables, className)}>
      {children}
    </div>
  );
}
```
