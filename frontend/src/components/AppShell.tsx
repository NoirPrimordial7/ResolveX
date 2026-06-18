import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="premium-pattern min-h-screen w-full text-[#F5F7FB] transition-colors">
      <Topbar />
      <main className="flex w-full flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:gap-5 lg:px-6 lg:py-6 xl:px-8">
        <Sidebar />
        <section className="min-w-0 flex-1 pb-8">{children}</section>
      </main>
    </div>
  );
}
