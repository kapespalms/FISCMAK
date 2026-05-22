import { redirect } from "next/navigation";

export default function LatticePage() {
  redirect("/app/objective?tab=lattice");
}
