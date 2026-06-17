import { ClipboardList, Headphones, LayoutDashboard, PlusCircle, Tickets } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const customerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets/new", label: "Create Ticket", icon: PlusCircle }
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tickets", label: "All Tickets", icon: ClipboardList }
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : customerLinks;

  return (
    <aside className="lg:w-[260px] lg:shrink-0">
      <nav className="flex gap-2 overflow-x-auto rounded-md border border-neutral-200 bg-white p-2 shadow-sm shadow-neutral-200/50 transition-colors dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-none lg:sticky lg:top-20 lg:flex-col lg:overflow-visible">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-fit items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500/25",
                  isActive
                    ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white"
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}

        <div className="mt-2 hidden rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <Tickets className="text-orange-600 dark:text-orange-400" size={20} aria-hidden="true" />
            <Headphones className="text-neutral-400" size={18} aria-hidden="true" />
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
