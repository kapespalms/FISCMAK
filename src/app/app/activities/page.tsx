import { redirect } from "next/navigation";

export default function ActivitiesPage() {
  redirect("/app/objective?tab=activities");
}
