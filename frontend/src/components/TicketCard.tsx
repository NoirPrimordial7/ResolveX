import { CalendarDays, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Ticket } from "../types";
import TicketStatusBadge from "./TicketStatusBadge";

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const createdDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(ticket.created_at));

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="panel-card block rounded-sm p-5 transition hover:border-orange-500/70 hover:bg-neutral-900"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">{ticket.category}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold text-white">{ticket.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">{ticket.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <TicketStatusBadge value={ticket.status} />
          <TicketStatusBadge value={ticket.priority} type="priority" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} aria-hidden="true" />
          {createdDate}
        </span>
        <span className="inline-flex items-center gap-2">
          <UserRound size={16} aria-hidden="true" />
          {ticket.assigned_to ? ticket.assigned_to.full_name : "Unassigned"}
        </span>
      </div>
    </Link>
  );
}
