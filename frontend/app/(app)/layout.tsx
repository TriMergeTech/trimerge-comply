import Sidebar from "@/components/sharedComponents/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 pt-16 md:pt-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
