import { redirect } from "next/navigation";

export default function DocumentsPage() {
  redirect("/app/objective?tab=documents");
}
