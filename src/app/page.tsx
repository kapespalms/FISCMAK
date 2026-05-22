import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Upload, Grid3X3, FileText, MessageCircle } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload", desc: "CV & career documents" },
  { icon: MessageCircle, title: "Capture", desc: "Talk with Mak" },
  { icon: Grid3X3, title: "Lattice", desc: "8×8 career map" },
  { icon: FileText, title: "Outputs", desc: "Reviews, CV bullets, more" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-fiscmak-border px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fiscmak-green text-white">
            <span className="text-xl font-bold">▶</span>
          </div>
          <span className="text-xl font-bold">FISCMAK</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Understand your career
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-fiscmak-muted">
            Capture invisible work, map your 8×8 career lattice, and generate
            publication-ready CV bullets, reviews, and promotion narratives —
            with evidence you can trace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button className="gap-2">
                Get started <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-fiscmak-border bg-fiscmak-subtle py-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-lg border border-fiscmak-border bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fiscmak-green-light text-fiscmak-green">
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-fiscmak-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-fiscmak-border px-6 py-8 text-center text-sm text-fiscmak-muted">
        <p>© {new Date().getFullYear()} FISCMAK · Privacy · About</p>
      </footer>
    </div>
  );
}
