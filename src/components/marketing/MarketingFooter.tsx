import Link from "next/link";
import { ContactFormPopover } from "@/components/marketing/ContactFormPopover";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerLinks: FooterLink[] = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative", external: true },
  { label: "Institutions", href: "/institutions" },
  { label: "FAQ", href: "/faq" },
  { label: "Sign In", href: "/login" },
];

export function MarketingFooter() {
  return (
    <footer id="contact" aria-label="Footer navigation" className="relative z-[1] border-t border-white/10">
      <div className="relative px-6 pt-10 md:px-10 md:pt-14">
        <ContactFormPopover className="pb-4" />
      </div>

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

          <p className="font-futura-medium text-sm text-gray-500">
            © {new Date().getFullYear()} FISCMAK
          </p>
        </div>
      </div>
    </footer>
  );
}
