import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 transition-colors dark:bg-neutral-950 dark:text-white">
      <Topbar />
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:gap-7 lg:px-8 lg:py-7">
        <Sidebar />
        <section className="min-w-0 flex-1 pb-8">{children}</section>
      </main>
    </div>
  );
}
