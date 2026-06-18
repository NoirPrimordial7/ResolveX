import { ClipboardList, Headphones, LayoutDashboard, Repeat2, PlusCircle, Tickets, UserRoundCog, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const customerLinks = [
  { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets/new", label: "Create Ticket", icon: PlusCircle }
];

const agentLinks = [
  { to: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agent/tickets", label: "Assigned Tickets", icon: Headphones }
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tickets", label: "All Tickets", icon: ClipboardList },
  { to: "/admin/agents", label: "Agents", icon: UsersRound },
  { to: "/admin/reassignment-requests", label: "Reassignments", icon: Repeat2 }
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : user?.role === "support_agent" ? agentLinks : customerLinks;

  return (
    <aside className="w-full lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:w-[260px] lg:shrink-0">
      <nav className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-sm shadow-neutral-200/50 transition-colors dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-none lg:flex lg:h-full lg:flex-col lg:overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-0 items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500/25",
                  isActive
                    ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white"
                )
              }
            >
              <Icon className="shrink-0" size={18} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="mt-2 hidden rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <Tickets className="text-orange-600 dark:text-orange-400" size={20} aria-hidden="true" />
            <UserRoundCog className="text-neutral-400" size={18} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-neutral-950 dark:text-white">ResolveX Desk</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Clear queues, faster replies, and tighter ownership.
          </p>
        </div>
      </nav>
    </aside>
  );
}
