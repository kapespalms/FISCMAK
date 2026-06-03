import { redirect } from "next/navigation";

/** SOAP route retired in v3. Lattice holds career analysis. */
export default function AssessmentPage() {
  redirect("/app/lattice");
}
