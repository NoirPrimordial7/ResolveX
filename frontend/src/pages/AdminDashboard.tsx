import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Flame, Inbox, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
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
    return <Card className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading dashboard...</Card>;
  }

  const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard description="All submitted requests" icon={ListChecks} indicator="Live" title="Total Tickets" value={dashboard.stats.total_tickets} />
        <StatCard description="Awaiting first action" icon={Clock3} indicator="Needs triage" title="Open" tone="amber" value={dashboard.stats.open_tickets} />
        <StatCard description="Currently owned" icon={Flame} indicator="Active" title="In Progress" tone="blue" value={dashboard.stats.in_progress_tickets} />
        <StatCard description="Completed tickets" icon={CheckCircle2} indicator="Healthy" title="Resolved" tone="green" value={dashboard.stats.resolved_tickets} />
        <StatCard description="High or urgent load" icon={AlertTriangle} indicator="Watch" title="High Priority" tone="red" value={dashboard.stats.high_priority_tickets} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Recent Tickets</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Newest customer issues entering the queue.</p>
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

        <Card className="h-fit p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Priority Overview</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Recent queue pressure by priority.</p>
          </div>
          <div className="mt-5 space-y-4">
            {priorities.map((priority) => (
              <div key={priority}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{priority}</span>
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400">{priorityCounts[priority]}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${Math.max(8, (priorityCounts[priority] / maxPriorityCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
