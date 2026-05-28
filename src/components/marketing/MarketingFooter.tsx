import Link from "next/link";
import { ContactFormPopover } from "@/components/marketing/ContactFormPopover";

type FooterLink = {
  label: string;
  href: string;
};

const footerLinks: FooterLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Meet Mak", href: "/meet-mak" },
  { label: "Our Narrative", href: "/our-narrative" },
  { label: "Institutions", href: "/institutions" },
  { label: "FAQ", href: "/faq" },
  { label: "Security", href: "/security" },
];

export function MarketingFooter() {
  return (
    <footer id="contact" aria-label="Footer navigation" className="marketing-site-footer relative z-[1] border-t border-white/10">
      <ContactFormPopover />

      <div className="px-6 py-10 md:px-10 md:py-12">
        <div className="flex items-end justify-between gap-6">
          <Link
            href="/"
            aria-label="FISCMAK home"
            className="font-futura-bold text-2xl tracking-wide md:text-3xl"
          >
            <span className="text-[#f1fbe7]">FISC</span>
            <span className="text-marketing-accent">MAK</span>
          </Link>

          <p className="font-futura-bold text-sm text-white">
            FISCMAK LLC · {new Date().getFullYear()}
          </p>
        </div>

        <div
          className="mx-4 mt-10 border-t border-white/10 md:mx-8"
          aria-hidden="true"
        />

        <nav
          aria-label="Footer links"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white"
        >
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-marketing-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
