import Link from "next/link";
import type { ElectiveCatalogEntry } from "@/lib/v2/programs/elective-catalog";
import { residencyPageHref } from "@/lib/v2/programs/uh-residency-content";

export function CatalogMatchSection({
  rotationCode,
  entries,
}: {
  rotationCode: string;
  entries: ElectiveCatalogEntry[];
}) {
  if (entries.length === 0) return null;

  const primary = entries[0];

  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-5">
      <h2 className="text-base font-semibold text-cx-forest-dark">Catalog match</h2>
      <p className="mt-1 text-sm text-cx-forest-dark/70">
        This rotation has a matching entry in the master elective catalog.
      </p>
      <div className="mt-3 rounded-xl border border-cx-forest-dark/10 bg-white/90 p-4">
        <p className="text-sm font-medium text-cx-forest-dark">{primary.name}</p>
        <p className="mt-0.5 text-xs text-cx-forest-dark/60">
          {primary.category}
          {primary.location ? ` · ${primary.location}` : ""}
        </p>
        <Link
          href={`/app/residency/electives?highlight=${encodeURIComponent(primary.id)}`}
          className="mt-3 inline-block text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
        >
          View in elective catalog →
        </Link>
      </div>
      {entries.length > 1 && (
        <p className="mt-2 text-xs text-cx-forest-dark/55">
          +{entries.length - 1} more catalog {entries.length - 1 === 1 ? "match" : "matches"} for{" "}
          {rotationCode.replace(/_/g, " ")}
        </p>
      )}
      {primary.rotation_code && primary.rotation_code !== rotationCode && (
        <p className="mt-2 text-xs text-cx-forest-dark/55">
          Also see{" "}
          <Link href={residencyPageHref(primary.rotation_code)} className="underline-offset-2 hover:underline">
            {primary.rotation_code.replace(/_/g, " ")} rotation guide
          </Link>
        </p>
      )}
    </section>
  );
}
