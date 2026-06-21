import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import PixelIcon from "./PixelIcon";
import type { PixelIconName } from "./PixelIcon";

const customerLinks = [
  { to: "/customer/dashboard", label: "Student Helpdesk", icon: "dashboard" },
  { to: "/tickets/new", label: "Raise Query", icon: "plus" }
];

const agentLinks = [
  { to: "/agent/dashboard", label: "Faculty Desk", icon: "dashboard" },
  { to: "/agent/tickets", label: "Student Queries", icon: "headset" }
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Head Dashboard", icon: "dashboard" },
  { to: "/admin/tickets", label: "All Queries", icon: "clipboard" },
  { to: "/admin/agents", label: "Faculty", icon: "users" },
  { to: "/admin/reassignment-requests", label: "Handovers", icon: "repeat" }
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const links = (user?.role === "admin" ? adminLinks : user?.role === "support_agent" ? agentLinks : customerLinks) as Array<{
    to: string;
    label: string;
    icon: PixelIconName;
  }>;

  return (
    <nav className="app-sidebar">
      <div className="grid grid-cols-1 gap-2">
        {links.map((item) => {
          return (
            <NavLink
              key={item.to}
              onClick={onClose}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex min-w-0 items-center gap-3 border px-3 py-3 text-xs font-black uppercase outline-none transition focus-visible:ring-2 focus-visible:ring-accent-500/25",
                  isActive
                    ? "rounded-xl border-accent-500/45 bg-accent-500/10 text-orange-700 shadow-[0_10px_24px_rgba(255,75,36,0.12)] dark:rounded-sm dark:text-accent-200 dark:shadow-none"
                    : "rounded-xl border-transparent app-text-subtle hover:border-orange-200/50 hover:bg-white/65 hover:text-stone-950 dark:rounded-sm dark:hover:border-white/10 dark:hover:bg-white/[0.05] dark:hover:text-[#F5F1EA]"
                )
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-200/45 bg-white/65 text-current shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] group-hover:border-accent-500/35 dark:rounded-sm dark:border-white/10 dark:bg-[#0B0B0A] dark:shadow-none">
                <PixelIcon name={item.icon} size={22} />
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="app-card-muted mt-auto hidden p-4 lg:block">
        <div className="mb-4 flex items-center justify-between text-accent-400">
          <PixelIcon name="ticket" size={24} />
          <PixelIcon className="app-text-subtle" name="settings" size={22} />
        </div>
        <p className="display-type text-2xl leading-none app-text-primary">Placement Desk</p>
        <p className="mt-2 text-xs leading-5 app-text-muted">
          Student placement queries, faculty ownership, and placement cell decisions in one control surface.
        </p>
      </div>
    </nav>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <aside className="w-full lg:sticky lg:top-20 lg:h-[calc(100vh-5.75rem)] lg:w-[232px] lg:shrink-0">
      <div className="hidden h-full lg:block">
        <SidebarNav />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            type="button"
          />
          <div className="absolute left-0 top-0 h-full w-[min(82vw,300px)] p-3">
            <SidebarNav onClose={onClose} />
          </div>
        </div>
      )}
    </aside>
  );
}
