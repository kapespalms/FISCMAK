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
