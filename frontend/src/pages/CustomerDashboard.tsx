import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
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
            <PixelIcon name="plus" size={18} />
            Create Ticket
          </Link>
        }
        description="Track your submitted issues and continue conversations with the support team."
        eyebrow="Customer Dashboard"
        title="Support Queues Under Control"
      />

      <Card className="relative overflow-hidden p-5">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,rgba(255,75,36,0.12),transparent)] lg:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar size="lg" user={user} />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-sm border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-black uppercase text-accent-200">
                <PixelIcon name="spark" size={16} />
                Welcome back
              </p>
              <h2 className="display-type mt-4 text-4xl leading-none text-[#F5F1EA]">{user?.full_name}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#A7A29A]">
                Create a ticket with enough context, then follow status updates and replies from this dashboard.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-72 xl:w-80">
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="display-type text-3xl leading-none text-[#F5F1EA]">{stats.total}</p>
              <p className="text-[11px] font-black uppercase text-[#A7A29A]">Total</p>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="display-type text-3xl leading-none text-[#F5F1EA]">{stats.open}</p>
              <p className="text-[11px] font-black uppercase text-[#A7A29A]">Open</p>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="display-type text-3xl leading-none text-[#F5F1EA]">{stats.resolved}</p>
              <p className="text-[11px] font-black uppercase text-[#A7A29A]">Done</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard description="All submitted requests" indicator="Mine" title="My Tickets" value={stats.total} />
        <StatCard description="Awaiting response" indicator="Active" title="Open" tone="amber" value={stats.open} />
        <StatCard description="Support is working" indicator="Owned" title="In Progress" tone="blue" value={stats.inProgress} />
        <StatCard description="Completed issues" indicator="Closed loop" title="Resolved" tone="green" value={stats.resolved} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-black uppercase text-[#F5F1EA]">My Tickets</h2>
            <p className="mt-1 text-sm text-[#A7A29A]">Filter your queue by current status.</p>
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
        <Card className="p-5 text-sm text-[#A7A29A]">Loading tickets...</Card>
      ) : tickets.length === 0 ? (
        <EmptyState
          action={
            <Link className={buttonClassName({ variant: "primary" })} to="/tickets/new">
              <PixelIcon name="plus" size={18} />
              Create Ticket
            </Link>
          }
          description="Create a ticket when you need help from the support team. It will appear here immediately."
          title={statusFilter ? "No tickets match this filter" : "You're all caught up"}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
