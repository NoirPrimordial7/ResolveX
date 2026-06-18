import type { ReactNode } from "react";
import type { Ticket } from "../types";
import Avatar from "./Avatar";
import Card from "./Card";
import PixelIcon from "./PixelIcon";
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
          <p className="flex items-center gap-2 text-[11px] font-black uppercase text-accent-400">
            <PixelIcon name="ticket" size={18} />
            {ticket.category}
          </p>
          <h1 className="display-type mt-4 text-4xl leading-none text-[#F5F1EA]">{ticket.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#A7A29A]">{ticket.description}</p>
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-[#A7A29A]">
                  <PixelIcon name="user" size={22} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase text-[#726D66]">{item.label}</p>
                <p className="mt-1 truncate text-sm font-black uppercase text-[#F5F1EA]">{item.user?.full_name || "Unassigned"}</p>
                {item.user?.email && <p className="mt-0.5 truncate text-xs text-[#A7A29A]">{item.user.email}</p>}
              </div>
            </div>
          ))}

          <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-1">
            <div className="bg-[#111111] p-4">
              <dt className="flex items-center gap-2 text-[11px] font-black uppercase text-[#726D66]">
                <PixelIcon name="calendar" size={16} />
                Created
              </dt>
              <dd className="mt-2 text-sm font-semibold text-[#F5F1EA]">{formatDateTime(ticket.created_at)}</dd>
            </div>
            <div className="bg-[#111111] p-4">
              <dt className="flex items-center gap-2 text-[11px] font-black uppercase text-[#726D66]">
                <PixelIcon name="clock" size={16} />
                Updated
              </dt>
              <dd className="mt-2 text-sm font-semibold text-[#F5F1EA]">{formatDateTime(ticket.updated_at)}</dd>
            </div>
          </div>
        </div>
      </Card>

      {children}
    </aside>
  );
}
