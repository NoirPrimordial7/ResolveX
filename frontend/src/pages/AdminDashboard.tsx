import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Flame, ListChecks } from "lucide-react";

import { ticketApi } from "../api/ticketApi";
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
    return <p className="text-neutral-400">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-white">ResolveX Control Center</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Tickets" value={dashboard.stats.total_tickets} icon={ListChecks} />
        <StatCard title="Open" value={dashboard.stats.open_tickets} icon={Clock3} tone="amber" />
        <StatCard title="In Progress" value={dashboard.stats.in_progress_tickets} icon={Flame} tone="blue" />
        <StatCard title="Resolved" value={dashboard.stats.resolved_tickets} icon={CheckCircle2} tone="green" />
        <StatCard title="High Priority" value={dashboard.stats.high_priority_tickets} icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
          {dashboard.recent_tickets.length === 0 ? (
            <div className="panel-card rounded-sm p-6 text-sm text-neutral-400">No tickets created yet.</div>
          ) : (
            <div className="grid gap-4">
              {dashboard.recent_tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>

        <section className="panel-card h-fit rounded-sm p-5">
          <h2 className="text-xl font-bold text-white">Priority Overview</h2>
          <div className="mt-5 space-y-4">
            {priorities.map((priority) => (
              <div key={priority}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-300">{priority}</span>
                  <span className="text-neutral-500">{priorityCounts[priority]}</span>
                </div>
                <div className="h-2 rounded-sm bg-neutral-800">
                  <div
                    className="h-2 rounded-sm bg-orange-500"
                    style={{ width: `${Math.min(priorityCounts[priority] * 20, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
