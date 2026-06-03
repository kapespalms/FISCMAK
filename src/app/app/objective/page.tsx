import { redirect } from "next/navigation";

/** SOAP route retired in v3. Lattice is the new home for career evidence. */
export default function ObjectivePage() {
  redirect("/app/lattice");
}
