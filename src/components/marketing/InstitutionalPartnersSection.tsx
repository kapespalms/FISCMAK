import Link from "next/link";

const cards = [
  {
    title: "CCC PREP IN MINUTES, NOT HOURS",
    body: "Import MedHub evals, synthesize pre-CCC summaries, and export cohort PDFs — built for psychiatry program directors and coordinators.",
    className: "from-yellow-200 to-yellow-100 text-gray-900",
    bodyClass: "text-gray-800",
  },
  {
    title: "MILESTONE HEATMAPS THAT MATCH ACGME",
    body: "21 psychiatry subcompetencies with PGY benchmarks, self-vs-faculty discrepancy, and ILP goals drafted from gaps.",
    className: "from-pink-200 to-pink-100 text-gray-900",
    bodyClass: "text-gray-800",
  },
  {
    title: "PRECISION IN PROGRAM OUTCOMES",
    body: "Tailored to each program's specialty, size, and goals — with measurable wellness and retention metrics.",
    className: "from-blue-900 to-blue-800 text-white",
    bodyClass: "text-gray-300",
  },
  {
    title: "SEAMLESSLY CONNECTING ACROSS INSTITUTIONS",
    body: "Consistent career development messaging across diverse residency programs and departments.",
    className: "from-red-900 to-red-800 text-white",
    bodyClass: "text-gray-300",
  },
];

export function InstitutionalPartnersSection() {
  return (
    <section id="institutions" aria-label="Institutional partnerships" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-4 text-4xl text-cx-forest-dark md:text-5xl">
          INSTITUTIONAL
          <br />
          <span className="text-marketing-accent">PARTNERSHIPS</span>
        </h2>
        <p className="mb-12 text-lg text-cx-forest-dark/65">
          GME programs use FISCMAK for MedHub import, pre-CCC synthesis, milestone tracking, and
          resident career development — starting with UH Psychiatry.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-lg bg-gradient-to-br p-8 ${card.className}`}
            >
              <h3 className="font-futura-bold mb-4 text-2xl">{card.title}</h3>
              <p className={`text-sm leading-relaxed ${card.bodyClass}`}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/join/uh-psychiatry"
            className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Explore Partnerships →
          </Link>
        </div>
      </div>
    </section>
  );
}
