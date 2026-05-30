import Link from "next/link";
import { cn } from "@/lib/utils";
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

export function MarketingFooter({ hideNav = false }: { hideNav?: boolean }) {
  return (
    <footer id="contact" aria-label="Footer navigation" className="relative z-[1] border-t border-white/10">
      <ContactFormPopover />

      <div className="px-6 py-10 md:px-10 md:py-12">
        {!hideNav ? (
          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400"
          >
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-marketing-accent">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className={cn("flex items-end justify-between gap-6", !hideNav && "mt-10")}>
          <Link
            href="/"
            aria-label="FISCMAK home"
            className="font-futura-bold text-2xl tracking-wide md:text-3xl"
          >
            <span className="text-[#f1fbe7]">FISC</span>
            <span className="text-marketing-accent">MAK</span>
          </Link>

          <p className="font-futura-medium text-sm text-gray-500">
            FISCMAK LLC · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
