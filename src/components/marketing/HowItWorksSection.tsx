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
