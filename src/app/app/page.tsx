import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-fiscmak-muted">SOAP career intelligence</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card accent="green">
          <h2 className="text-lg font-semibold">Subjective</h2>
          <p className="mt-2 text-sm text-fiscmak-muted">Energy this week</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge energy="energizing">Teaching & mentoring</Badge>
            <Badge energy="draining">Admin meetings</Badge>
          </div>
          <p className="mt-4 text-sm">
            Most energizing:{" "}
            <strong>Scholarship × Educator</strong>
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Objective</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <strong>24</strong> activities logged
            </li>
            <li>
              <strong>6</strong> domains active
            </li>
            <li>
              <strong>4</strong> tracks active
            </li>
          </ul>
          <Link href="/app/lattice" className="mt-4 inline-block">
            <Button variant="link">View lattice →</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Assessment</h2>
          <p className="mt-2 text-sm">
            Pattern:{" "}
            <strong>Clinician-Educator with Emerging Systems Leadership</strong>
          </p>
          <ul className="mt-4 space-y-1 text-sm text-fiscmak-muted">
            <li>Recognition gap: 34%</li>
            <li>Alignment signal: 78%</li>
            <li>Career coherence: 0.72</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Plan</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
            <li>Log 2 more teaching activities</li>
            <li>Generate annual review draft</li>
            <li>Monthly reflection with Mak</li>
          </ul>
          <Link href="/app/studio" className="mt-4 inline-block">
            <Button>Generate output</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
