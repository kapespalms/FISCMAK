import { redirect } from "next/navigation";

/** SOAP route retired in v3. Dashboard is the new home. */
export default function SubjectivePage() {
  redirect("/app/dashboard");
}
