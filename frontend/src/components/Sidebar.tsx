import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import PixelIcon from "./PixelIcon";
import type { PixelIconName } from "./PixelIcon";

const customerLinks = [
  { to: "/customer/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/tickets/new", label: "Create Ticket", icon: "plus" }
];

const agentLinks = [
  { to: "/agent/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/agent/tickets", label: "Assigned Tickets", icon: "headset" }
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/tickets", label: "All Tickets", icon: "clipboard" },
  { to: "/admin/agents", label: "Agents", icon: "users" },
  { to: "/admin/reassignment-requests", label: "Reassignments", icon: "repeat" }
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
    <nav className="flex h-full flex-col overflow-y-auto border border-white/10 bg-[#111111]/94 p-2 shadow-premium shadow-black/35 backdrop-blur transition-colors">
      <div className="grid grid-cols-1 gap-2">
        {links.map((item) => {
          return (
            <NavLink
              key={item.to}
              onClick={onClose}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex min-w-0 items-center gap-3 rounded-sm border px-3 py-3 text-xs font-black uppercase outline-none transition focus-visible:ring-2 focus-visible:ring-accent-500/25",
                  isActive
                    ? "border-accent-500/55 bg-accent-500/12 text-accent-200"
                    : "border-transparent text-[#A7A29A] hover:border-white/10 hover:bg-white/[0.05] hover:text-[#F5F1EA]"
                )
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#0B0B0A] text-current group-hover:border-accent-500/35">
                <PixelIcon name={item.icon} size={22} />
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto hidden border border-white/10 bg-[#0B0B0A]/80 p-4 lg:block">
        <div className="mb-4 flex items-center justify-between text-accent-400">
          <PixelIcon name="ticket" size={24} />
          <PixelIcon className="text-[#726D66]" name="settings" size={22} />
        </div>
        <p className="display-type text-2xl leading-none text-[#F5F1EA]">Desk Ops</p>
        <p className="mt-2 text-xs leading-5 text-[#A7A29A]">
          Queue ownership, compact triage, and support conversations in one control surface.
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
