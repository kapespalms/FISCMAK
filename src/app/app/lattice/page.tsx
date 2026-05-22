import { LatticeGrid } from "@/components/lattice/LatticeGrid";
import { getDemoLatticeCells } from "@/lib/demo-data";

export default function LatticePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Career lattice</h1>
        <p className="mt-1 text-fiscmak-muted">8 domains × 8 tracks</p>
      </div>
      <LatticeGrid cells={getDemoLatticeCells()} />
    </div>
  );
}
