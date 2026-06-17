import { ClipboardList, LayoutDashboard, PlusCircle, Tickets } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
    <aside className="md:w-64 md:shrink-0">
      <nav className="panel-card flex gap-2 overflow-x-auto rounded-sm p-2 md:sticky md:top-20 md:flex-col">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex min-w-fit items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-orange-500 text-black"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                ].join(" ")
              }
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}

        <div className="mt-2 hidden rounded-sm border border-neutral-800 bg-[#080808] p-4 md:block">
          <Tickets className="mb-3 text-orange-400" size={22} aria-hidden="true" />
          <p className="text-sm font-semibold text-white">ResolveX</p>
          <p className="mt-1 text-xs leading-5 text-neutral-400">Resolve customer issues faster.</p>
        </div>
      </nav>
    </aside>
  );
}
