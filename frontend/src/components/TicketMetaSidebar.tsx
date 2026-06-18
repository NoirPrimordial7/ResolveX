import { CalendarDays, Clock3, UserRound } from "lucide-react";

import type { ReactNode } from "react";
import type { Ticket } from "../types";
import Avatar from "./Avatar";
import Card from "./Card";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

interface TicketMetaSidebarProps {
  ticket: Ticket;
  children?: ReactNode;
  customerLabel?: string;
}

export default function TicketMetaSidebar({ children, customerLabel = "Customer", ticket }: TicketMetaSidebarProps) {
  const people = [
    { label: customerLabel, user: ticket.created_by },
    { label: "Assigned to", user: ticket.assigned_to }
  ];

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-semibold uppercase text-accent-400">{ticket.category}</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-[#F5F7FB]">{ticket.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#AAB3C5]">{ticket.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={ticket.status} />
            <PriorityBadge value={ticket.priority} />
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {people.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              {item.user ? (
                <Avatar size="md" user={item.user} />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#AAB3C5]">
                  <UserRound size={18} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-[#7F8AA3]">{item.label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#F5F7FB]">{item.user?.full_name || "Unassigned"}</p>
                {item.user?.email && <p className="mt-0.5 truncate text-xs text-[#AAB3C5]">{item.user.email}</p>}
              </div>
            </div>
          ))}

          <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-1">
            <div className="bg-[#11141B] p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-[#7F8AA3]">
                <CalendarDays size={14} aria-hidden="true" />
                Created
              </dt>
              <dd className="mt-2 text-sm font-medium text-[#F5F7FB]">{formatDateTime(ticket.created_at)}</dd>
            </div>
            <div className="bg-[#11141B] p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-[#7F8AA3]">
                <Clock3 size={14} aria-hidden="true" />
                Updated
              </dt>
              <dd className="mt-2 text-sm font-medium text-[#F5F7FB]">{formatDateTime(ticket.updated_at)}</dd>
            </div>
          </div>
        </div>
      </Card>

      {children}
    </aside>
  );
}
