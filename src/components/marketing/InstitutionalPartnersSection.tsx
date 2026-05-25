import Link from "next/link";

const cards = [
  {
    title: "MASTERING CREATIVITY IN CAREER CLARITY",
    body: "Each element is designed to tell a compelling story and uncover the hidden value in physician work.",
    className: "from-yellow-200 to-yellow-100 text-gray-900",
    bodyClass: "text-gray-800",
  },
  {
    title: "SETTING TRENDS IN RESIDENT RETENTION",
    body: "Reshape how programs see and support their residents with longitudinal career intelligence.",
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
        <h2 className="font-futura-bold mb-4 text-4xl text-white md:text-5xl">
          INSTITUTIONAL
          <br />
          <span className="text-marketing-accent">PARTNERSHIPS</span>
        </h2>
        <p className="mb-12 text-lg text-gray-400">
          See how leading programs transform physician development with FISCMAK.
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
            href="/signup"
            className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Explore Partnerships →
          </Link>
        </div>
      </div>
    </section>
  );
}
