import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Inbox, ListChecks, PlusCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Avatar from "../components/Avatar";
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
    <div className="space-y-5">
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/tickets/new">
            <PlusCircle size={18} aria-hidden="true" />
            Create Ticket
          </Link>
        }
        description="Track your submitted issues and continue conversations with the support team."
        eyebrow="Customer Dashboard"
        title="Customer Support Hub"
      />

      <Card className="relative overflow-hidden p-5">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_70%_35%,rgba(231,111,81,0.2),transparent_45%)] lg:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar size="lg" user={user} />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-200">
                <Sparkles size={14} aria-hidden="true" />
                Welcome back
              </p>
              <h2 className="mt-4 text-xl font-semibold text-[#F5F7FB]">{user?.full_name}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#AAB3C5]">
                Create a ticket with enough context, then follow status updates and replies from this dashboard.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-72 xl:w-80">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-lg font-semibold text-[#F5F7FB]">{stats.total}</p>
              <p className="text-xs text-[#AAB3C5]">Total</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-lg font-semibold text-[#F5F7FB]">{stats.open}</p>
              <p className="text-xs text-[#AAB3C5]">Open</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-lg font-semibold text-[#F5F7FB]">{stats.resolved}</p>
              <p className="text-xs text-[#AAB3C5]">Done</p>
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
            <h2 className="text-lg font-semibold text-[#F5F7FB]">My Tickets</h2>
            <p className="mt-1 text-sm text-[#AAB3C5]">Filter your queue by current status.</p>
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
        <Card className="p-5 text-sm text-[#AAB3C5]">Loading tickets...</Card>
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
          title={statusFilter ? "No tickets match this filter" : "You're all caught up"}
        />
      ) : (
        <div className="grid gap-4 2xl:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
