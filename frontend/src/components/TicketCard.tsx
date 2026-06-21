import { Link } from "react-router-dom";

import type { Ticket } from "../types";
import Avatar from "./Avatar";
import PixelIcon from "./PixelIcon";
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
      className="panel-card pixel-frame group block p-5 transition hover:-translate-y-0.5 hover:border-accent-500/35 hover:shadow-[0_24px_70px_rgba(120,72,30,0.14)] dark:hover:translate-y-0 dark:hover:border-accent-500/45 dark:hover:shadow-glow"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase text-accent-400">
            <PixelIcon name="ticket" size={18} />
            {ticket.category}
          </p>
          <h3 className="mt-3 line-clamp-2 text-lg font-black uppercase app-text-primary transition-colors group-hover:text-orange-700 dark:group-hover:text-accent-300">
            {ticket.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 app-text-muted">{ticket.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-orange-200/45 pt-4 text-sm app-text-muted dark:border-white/10">
        <span className="inline-flex items-center gap-2">
          <PixelIcon name="calendar" size={18} />
          {createdDate}
        </span>
        <span className="inline-flex items-center gap-2">
          {ticket.assigned_to ? <Avatar size="sm" user={ticket.assigned_to} /> : <PixelIcon name="user" size={18} />}
          <span>{ticket.assigned_to ? ticket.assigned_to.full_name : "Unassigned faculty"}</span>
        </span>
      </div>
    </Link>
  );
}
