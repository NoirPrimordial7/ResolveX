import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Inbox, ListChecks, PlusCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
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
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/tickets/new">
            <PlusCircle size={18} aria-hidden="true" />
            Create Ticket
          </Link>
        }
        description="Track your submitted issues and continue conversations with the support team."
        eyebrow="Customer Dashboard"
        title="Your Support Hub"
      />

      <Card className="relative overflow-hidden p-5">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_70%_35%,rgba(249,115,22,0.18),transparent_45%)] dark:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
              <Sparkles size={14} aria-hidden="true" />
              Welcome back
            </p>
            <h2 className="mt-4 text-xl font-semibold text-neutral-950 dark:text-white">{user?.full_name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Create a ticket with enough context, then follow status updates and replies from this dashboard.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-64">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="text-lg font-semibold text-neutral-950 dark:text-white">{stats.total}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="text-lg font-semibold text-neutral-950 dark:text-white">{stats.open}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Open</p>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="text-lg font-semibold text-neutral-950 dark:text-white">{stats.resolved}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Done</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard description="All submitted requests" icon={ListChecks} indicator="Mine" title="My Tickets" value={stats.total} />
        <StatCard description="Awaiting response" icon={Clock3} indicator="Active" title="Open" tone="amber" value={stats.open} />
        <StatCard description="Support is working" icon={Clock3} indicator="Owned" title="In Progress" tone="blue" value={stats.inProgress} />
        <StatCard description="Completed issues" icon={CheckCircle2} indicator="Closed loop" title="Resolved" tone="green" value={stats.resolved} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">My Tickets</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Filter your queue by current status.</p>
          </div>
          <Select
            className="sm:w-56"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TicketStatus | "")}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="p-5 text-sm text-neutral-600 dark:text-neutral-400">Loading tickets...</Card>
      ) : tickets.length === 0 ? (
        <EmptyState
          action={
            <Link className={buttonClassName({ variant: "primary" })} to="/tickets/new">
              <PlusCircle size={18} aria-hidden="true" />
              Create Ticket
            </Link>
          }
          description="Create a ticket when you need help from the support team. It will appear here immediately."
          icon={Inbox}
          title="No tickets found"
        />
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
