import Link from "next/link";
import { FileText } from "lucide-react";
import { findEducationDocsForRotation } from "@/lib/v2/programs/rotation-education-links";

export function RelatedReadingSection({ rotationCode }: { rotationCode: string }) {
  const docs = findEducationDocsForRotation(rotationCode);
  if (docs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold text-cx-text">Related reading</h2>
        <Link
          href="/app/education"
          className="text-xs font-medium text-cx-text underline-offset-2 hover:underline"
        >
          Education hub →
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-cx-forest-dark/8">
        {docs.map((doc) => (
          <li key={doc.id}>
            <a
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 py-2.5 text-sm transition hover:text-cx-text"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-cx-text/45" aria-hidden />
              <span>
                <span className="font-medium text-cx-text">{doc.title}</span>
                {doc.subcategory && (
                  <span className="mt-0.5 block text-xs text-cx-text/55">{doc.subcategory}</span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
