import Link from "next/link";

export function ContactCtaSection() {
  return (
    <section id="contact" aria-label="Contact call to action" className="px-5 py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-marketing-accent/30 bg-gray-900/80 px-8 py-16 text-center">
        <h2 className="font-futura-bold text-3xl text-white md:text-4xl">
          Ready to make invisible work visible?
        </h2>
        <p className="mt-4 text-gray-400">
          Start free today, or reach out for an institutional demo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="font-futura-bold rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Get Started Free
          </Link>
          <a
            href="mailto:hello@fiscmak.com"
            className="font-futura-bold rounded border border-white/30 px-8 py-4 text-white transition hover:border-marketing-accent hover:text-marketing-accent"
          >
            Schedule a Demo
          </a>
        </div>
      </div>
    </section>
  );
}
