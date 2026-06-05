import Link from "next/link";

const cards = [
  {
    title: "CCC PREP IN MINUTES",
    body: "Import MedHub evals, synthesize pre-CCC summaries, and export cohort PDFs — built for psychiatry program directors and coordinators.",
    className: "bg-[#F5EDD8] text-cx-text",
    bodyClass: "text-cx-text/70",
  },
  {
    title: "MILESTONE HEATMAPS THAT MATCH ACGME",
    body: "21 psychiatry subcompetencies with PGY benchmarks, self-vs-faculty discrepancy, and ILP goals drafted from gaps.",
    className: "bg-[#E6ECF0] text-cx-text",
    bodyClass: "text-cx-text/70",
  },
  {
    title: "PRECISION IN PROGRAM OUTCOMES",
    body: "Tailored to each program's specialty, size, and goals — with measurable wellness and retention metrics.",
    className: "bg-[#34597A] text-white",
    bodyClass: "text-white/75",
  },
  {
    title: "BUILT FOR YOUR INSTITUTION",
    body: "Consistent career development messaging across diverse residency programs and departments.",
    className: "bg-cx-forest-dark text-white",
    bodyClass: "text-white/75",
  },
];

export function InstitutionalPartnersSection() {
  return (
    <section id="institutions" aria-label="Institutional partnerships" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-4 text-4xl text-cx-text md:text-5xl">
          INSTITUTIONAL
          <br />
          <span className="text-marketing-accent">PARTNERSHIPS</span>
        </h2>
        <p className="mb-12 max-w-2xl text-lg text-cx-text/60">
          GME programs use FISCMAK for MedHub import, pre-CCC synthesis, milestone tracking, and
          resident career development — starting with UH Psychiatry.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl p-8 ${card.className}`}
            >
              <h3 className="font-futura-bold mb-4 text-xl leading-snug">{card.title}</h3>
              <p className={`text-sm leading-relaxed ${card.bodyClass}`}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/join/uh-psychiatry"
            className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-white shadow-[0_4px_16px_rgba(172,134,54,0.3)] transition hover:bg-fis-gold/90 hover:shadow-none"
          >
            Explore Partnerships
          </Link>
        </div>
      </div>
    </section>
  );
}
