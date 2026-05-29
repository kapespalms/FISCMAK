import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import type { LegalSection } from "@/lib/legal/terms-content";

type LegalDocumentPageProps = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalDocumentPage({ title, lastUpdated, sections }: LegalDocumentPageProps) {
  return (
    <MarketingPageShell>
      <article className="relative px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <header className="border-b border-cx-forest-dark/15 pb-8">
            <p className="font-futura-medium text-sm uppercase tracking-wide text-cx-forest-dark/60">
              Legal
            </p>
            <h1 className="font-futura-bold mt-2 text-3xl text-cx-forest-dark md:text-4xl">
              {title}
            </h1>
            <p className="font-futura-medium mt-3 text-sm text-cx-forest-dark/70">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                {section.title !== "Welcome" && section.title !== "Overview" ? (
                  <h2 className="font-futura-bold text-xl text-cx-forest-dark">{section.title}</h2>
                ) : null}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="font-futura-book mt-4 text-base leading-relaxed text-cx-forest-dark/90"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.subsections?.map((sub) => (
                  <div key={sub.title} className="mt-6">
                    <h3 className="font-futura-medium text-lg text-cx-forest-dark">{sub.title}</h3>
                    {sub.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 48)}
                        className="font-futura-book mt-3 text-base leading-relaxed text-cx-forest-dark/90"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>

          <p className="font-futura-medium mt-12 border-t border-cx-forest-dark/15 pt-8 text-sm text-cx-forest-dark/70">
            See also{" "}
            <Link href="/legal/terms-of-service" className="text-marketing-accent hover:underline">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/legal/privacy-policy" className="text-marketing-accent hover:underline">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/security" className="text-marketing-accent hover:underline">
              Security
            </Link>
          </p>
        </div>
      </article>
    </MarketingPageShell>
  );
}
