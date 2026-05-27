import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ResidencyRotationWorkspace } from "@/components/workspace/ResidencyRotationWorkspace";
import { getResidencyPage } from "@/lib/v2/programs/uh-residency-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ResidencyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getResidencyPage(slug);
  if (!page) notFound();

  return (
    <PageShell title="" maxWidth="lg" className="[&_header]:hidden">
      <ResidencyRotationWorkspace page={page} />
    </PageShell>
  );
}
