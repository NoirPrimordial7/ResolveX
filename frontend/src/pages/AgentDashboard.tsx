import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Headphones, Inbox, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TicketCard from "../components/TicketCard";
import type { AgentDashboardResponse } from "../types";

export default function AgentDashboard() {
  const [dashboard, setDashboard] = useState<AgentDashboardResponse | null>(null);

  useEffect(() => {
    ticketApi.agentDashboard().then(setDashboard);
  }, []);

  if (!dashboard) {
    return <Card className="p-6 text-sm text-[#AAB3C5]">Loading dashboard...</Card>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/agent/tickets">
            <Headphones size={17} aria-hidden="true" />
            Open Queue
          </Link>
        }
        description="Work through assigned tickets, update customers, and keep status current."
        eyebrow="Support Agent"
        title="Assigned Ticket Dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Tickets assigned to you"
          icon={ListChecks}
          indicator="Owned"
          title="Assigned"
          value={dashboard.stats.assigned_tickets}
        />
        <StatCard
          description="Waiting for first action"
          icon={Clock3}
          indicator="Start next"
          title="Open"
          tone="amber"
          value={dashboard.stats.open_assigned_tickets}
        />
        <StatCard
          description="Currently being handled"
          icon={Headphones}
          indicator="Active"
          title="In Progress"
          tone="blue"
          value={dashboard.stats.in_progress_assigned_tickets}
        />
        <StatCard
          description="Resolved by you"
          icon={CheckCircle2}
          indicator="Done"
          title="Resolved"
          tone="green"
          value={dashboard.stats.resolved_tickets}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F5F7FB]">Recent Assigned Tickets</h2>
          <p className="mt-1 text-sm text-[#AAB3C5]">
            Newest updates in your assigned workload.
          </p>
        </div>

        {dashboard.recent_tickets.length === 0 ? (
          <EmptyState
            description="Tickets assigned by an admin will appear here."
            icon={Inbox}
            title="You're all caught up"
          />
        ) : (
          <div className="grid gap-4 2xl:grid-cols-2">
            {dashboard.recent_tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} to={`/agent/tickets/${ticket.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
