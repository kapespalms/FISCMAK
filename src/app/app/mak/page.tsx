import { MakChat } from "@/components/mak/MakChat";

export default function MakPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mak</h1>
        <p className="mt-1 text-fiscmak-muted">Your career coach</p>
      </div>
      <MakChat />
    </div>
  );
}
