import { AppSidebar } from "@/components/layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-fiscmak-subtle p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
