import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer aria-label="Footer navigation" className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <p className="font-futura-bold text-2xl">
          <span className="text-[#f1fbe7]">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </p>
        <nav aria-label="Footer links" className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <a href="#how-it-works" className="hover:text-marketing-accent">
            How It Works
          </a>
          <a href="#our-narrative" className="hover:text-marketing-accent">
            Our Narrative
          </a>
          <a href="#institutions" className="hover:text-marketing-accent">
            Institutions
          </a>
          <a href="#faq" className="hover:text-marketing-accent">
            FAQ
          </a>
          <Link href="/login" className="hover:text-marketing-accent">
            Sign In
          </Link>
        </nav>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} FISCMAK</p>
      </div>
    </footer>
  );
}
