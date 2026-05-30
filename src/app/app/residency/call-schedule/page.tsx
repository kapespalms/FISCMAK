import { redirect } from "next/navigation";

export default function CallSchedulePage() {
  redirect("/app/schedule?tab=call");
}
