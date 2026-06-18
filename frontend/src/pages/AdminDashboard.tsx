import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Flame, Inbox, ListChecks, Repeat2, UserRoundX } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TicketCard from "../components/TicketCard";
import type { AdminDashboardResponse, TicketPriority } from "../types";
import { priorities } from "../types";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);

  useEffect(() => {
    ticketApi.adminDashboard().then(setDashboard);
  }, []);

  const priorityCounts = useMemo(() => {
    const counts = priorities.reduce(
      (accumulator, priority) => ({ ...accumulator, [priority]: 0 }),
      {} as Record<TicketPriority, number>
    );
    dashboard?.recent_tickets.forEach((ticket) => {
      counts[ticket.priority] += 1;
    });
    return counts;
  }, [dashboard]);

  if (!dashboard) {
    return <Card className="p-6 text-sm text-[#AAB3C5]">Loading dashboard...</Card>;
  }

  const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/admin/tickets">
            Manage Queue
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        }
        description="Monitor queue health, ownership, and priority pressure from one focused control center."
        eyebrow="Admin Dashboard"
        title="ResolveX Control Center"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard description="All submitted requests" icon={ListChecks} indicator="Live" title="Total Tickets" value={dashboard.stats.total_tickets} />
        <StatCard description="Awaiting first action" icon={Clock3} indicator="Needs triage" title="Open" tone="amber" value={dashboard.stats.open_tickets} />
        <StatCard description="Currently owned" icon={Flame} indicator="Active" title="In Progress" tone="blue" value={dashboard.stats.in_progress_tickets} />
        <StatCard description="Completed tickets" icon={CheckCircle2} indicator="Healthy" title="Resolved" tone="green" value={dashboard.stats.resolved_tickets} />
        <StatCard description="Needs assignment" icon={UserRoundX} indicator="Queue" title="Unassigned" tone="red" value={dashboard.stats.unassigned_tickets} />
        <StatCard
          description="Agent handoff requests"
          icon={Repeat2}
          indicator="Pending"
          title="Reassignments"
          tone="amber"
          value={dashboard.stats.pending_reassignment_requests}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FB]">Recent Tickets</h2>
              <p className="mt-1 text-sm text-[#AAB3C5]">Newest customer issues entering the queue.</p>
            </div>
          </div>
          {dashboard.recent_tickets.length === 0 ? (
            <EmptyState
              action={
                <Link className={buttonClassName({ variant: "secondary" })} to="/admin/tickets">
                  View Ticket Queue
                </Link>
              }
              description="New customer tickets will appear here as soon as they are created."
              icon={Inbox}
              title="No tickets created yet"
            />
          ) : (
            <div className="grid gap-4">
              {dashboard.recent_tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-5">
          <Card className="h-fit p-5">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FB]">Priority Overview</h2>
              <p className="mt-1 text-sm text-[#AAB3C5]">Recent queue pressure by priority.</p>
            </div>
            <div className="mt-5 space-y-4">
              {priorities.map((priority) => (
                <div key={priority}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#DCE3F2]">{priority}</span>
                    <span className="font-semibold text-[#AAB3C5]">{priorityCounts[priority]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-accent-500"
                      style={{ width: `${Math.max(8, (priorityCounts[priority] / maxPriorityCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="h-fit p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#F5F7FB]">Agent Workload</h2>
                <p className="mt-1 text-sm text-[#AAB3C5]">Active ticket ownership by agent.</p>
              </div>
              <AlertTriangle className="text-accent-400" size={18} aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-4">
              {dashboard.agent_workload.length === 0 ? (
                <p className="text-sm text-[#AAB3C5]">No support agents have been created.</p>
              ) : (
                dashboard.agent_workload.map((agent) => (
                  <div key={agent.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar size="sm" user={agent} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#F5F7FB]">{agent.full_name}</p>
                          <p className="truncate text-xs text-[#AAB3C5]">{agent.email}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-200">
                        {agent.active_ticket_count} active
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[#AAB3C5]">
                        {agent.open_ticket_count} open
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[#AAB3C5]">
                        {agent.in_progress_ticket_count} active
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[#AAB3C5]">
                        {agent.resolved_ticket_count} done
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
