import { CalendarDays, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Ticket } from "../types";
import Avatar from "./Avatar";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface TicketCardProps {
  ticket: Ticket;
  to?: string;
}

export default function TicketCard({ ticket, to }: TicketCardProps) {
  const createdDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(ticket.created_at));

  return (
    <Link
      to={to || `/tickets/${ticket.id}`}
      className="panel-card group block p-5 transition hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-glow"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-accent-400">{ticket.category}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-[#F5F7FB] transition-colors group-hover:text-accent-300">
            {ticket.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#AAB3C5]">{ticket.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm text-[#AAB3C5]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} aria-hidden="true" />
          {createdDate}
        </span>
        <span className="inline-flex items-center gap-2">
          {ticket.assigned_to ? <Avatar size="sm" user={ticket.assigned_to} /> : <UserRound size={16} aria-hidden="true" />}
          <span>{ticket.assigned_to ? ticket.assigned_to.full_name : "Unassigned"}</span>
        </span>
      </div>
    </Link>
  );
}
