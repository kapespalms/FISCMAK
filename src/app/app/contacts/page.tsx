import { PageShell } from "@/components/layout/PageShell";
import { ContactsWorkspace } from "@/components/workspace/ContactsWorkspace";

export default function ContactsPage() {
  return (
    <PageShell title="" maxWidth="lg" className="[&_header]:hidden">
      <ContactsWorkspace />
    </PageShell>
  );
}
