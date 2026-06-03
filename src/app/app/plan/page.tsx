import { redirect } from "next/navigation";

/** SOAP route retired in v3. Goals is the new home for strategy. */
export default function PlanPage() {
  redirect("/app/goals");
}
