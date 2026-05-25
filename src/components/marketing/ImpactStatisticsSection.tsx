const stats = [
  { value: "65%", label: "Better burnout signal detection" },
  { value: "40%", label: "Reduction in attrition risk" },
  { value: "5–10%", label: "Typical retention improvement" },
  { value: "21×", label: "Program ROI within year one" },
];

export function ImpactStatisticsSection() {
  return (
    <section id="impact-statistics" aria-label="Impact statistics" className="border-y border-white/10 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-4 text-center text-4xl text-white md:text-5xl">
          Measurable <span className="text-marketing-accent">Impact</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-400">
          Longitudinal career intelligence that programs and physicians can act on.
        </p>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-gray-900/80 p-6 text-center">
              <p className="font-futura-bold text-4xl text-marketing-accent md:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
