import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, ListChecks, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import StatCard from "../components/StatCard";
import TicketCard from "../components/TicketCard";
import { useAuth } from "../context/AuthContext";
import type { Ticket, TicketStatus } from "../types";
import { statuses } from "../types";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ticketApi
      .myTickets(statusFilter)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "Resolved").length
    }),
    [tickets]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Customer Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Your Support Hub</h1>
          <p className="mt-2 text-sm text-neutral-400">Welcome, {user?.full_name}</p>
        </div>
        <Link className="primary-button" to="/tickets/new">
          <PlusCircle size={18} aria-hidden="true" />
          Create Ticket
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Tickets" value={stats.total} icon={ListChecks} />
        <StatCard title="Open" value={stats.open} icon={Clock3} tone="amber" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock3} tone="blue" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} tone="green" />
      </div>

      <div className="panel-card rounded-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-white">My Tickets</h2>
          <select
            className="field sm:w-56"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TicketStatus | "")}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="panel-card rounded-sm p-8 text-center">
          <p className="text-lg font-semibold text-white">No tickets found</p>
          <p className="mt-2 text-sm text-neutral-400">Create a ticket when you need support.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
