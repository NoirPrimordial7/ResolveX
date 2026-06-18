import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="premium-pattern min-h-screen w-full text-[#F5F1EA] transition-colors">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="flex w-full flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:gap-5 lg:px-5 lg:py-5 xl:px-6">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className="min-w-0 flex-1 pb-8">{children}</section>
      </main>
    </div>
  );
}
