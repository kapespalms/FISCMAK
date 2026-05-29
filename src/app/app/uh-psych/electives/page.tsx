import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ highlight?: string }>;
};

export default async function UhPsychElectivesRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.highlight ? `?highlight=${encodeURIComponent(params.highlight)}` : "";
  redirect(`/app/residency/electives${q}`);
}
