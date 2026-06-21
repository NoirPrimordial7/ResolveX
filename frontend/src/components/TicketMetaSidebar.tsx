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

export default function TicketMetaSidebar({ children, customerLabel = "Student", ticket }: TicketMetaSidebarProps) {
  const people = [
    { label: customerLabel, user: ticket.created_by },
    { label: "Faculty coordinator", user: ticket.assigned_to }
  ];

  return (
    <aside className="space-y-4 self-start">
      <Card className="overflow-hidden">
        <div className="border-b border-orange-200/70 p-5 dark:border-white/10">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase text-accent-400">
            <PixelIcon name="ticket" size={18} />
            {ticket.category}
          </p>
          <h1 className="display-type mt-4 break-words pt-0.5 text-4xl leading-[0.98] app-text-primary">{ticket.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 app-text-muted">{ticket.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={ticket.status} />
            <PriorityBadge value={ticket.priority} />
          </div>
        </div>

        <div className="divide-y divide-orange-200/70 dark:divide-white/10">
          {people.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              {item.user ? (
                <Avatar size="md" user={item.user} />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-orange-200/80 bg-white/70 text-stone-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#A7A29A]">
                  <PixelIcon name="user" size={22} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase app-text-subtle">{item.label}</p>
                <p className="mt-1 truncate text-sm font-black uppercase app-text-primary">{item.user?.full_name || "Unassigned"}</p>
                {item.user?.email && <p className="mt-0.5 truncate text-xs app-text-muted">{item.user.email}</p>}
              </div>
            </div>
          ))}

          <div className="grid gap-px bg-orange-200/70 dark:bg-white/10 sm:grid-cols-2 xl:grid-cols-1">
            <div className="bg-orange-50/80 p-4 dark:bg-[#111111]">
              <dt className="flex items-center gap-2 text-[11px] font-black uppercase app-text-subtle">
                <PixelIcon name="calendar" size={16} />
                Created
              </dt>
              <dd className="mt-2 text-sm font-semibold app-text-primary">{formatDateTime(ticket.created_at)}</dd>
            </div>
            <div className="bg-orange-50/80 p-4 dark:bg-[#111111]">
              <dt className="flex items-center gap-2 text-[11px] font-black uppercase app-text-subtle">
                <PixelIcon name="clock" size={16} />
                Updated
              </dt>
              <dd className="mt-2 text-sm font-semibold app-text-primary">{formatDateTime(ticket.updated_at)}</dd>
            </div>
          </div>
        </div>
      </Card>

      {children}
    </aside>
  );
}
