import { useEffect, useState } from "react";
import { Headphones, Inbox, ListChecks, Mail } from "lucide-react";

import { ticketApi } from "../api/ticketApi";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import type { AgentWorkload } from "../types";

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketApi
      .adminAgents()
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  const activeTickets = agents.reduce((total, agent) => total + agent.active_ticket_count, 0);
  const resolvedTickets = agents.reduce((total, agent) => total + agent.resolved_ticket_count, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        description="Monitor support agent capacity before assigning or reassigning tickets."
        eyebrow="Admin Agents"
        title="Support Agent Workload"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard description="Active support users" icon={Headphones} indicator="Team" title="Agents" value={agents.length} />
        <StatCard description="Open or in progress" icon={ListChecks} indicator="Owned" title="Active Tickets" tone="blue" value={activeTickets} />
        <StatCard description="Completed by agents" icon={ListChecks} indicator="Done" title="Resolved Tickets" tone="green" value={resolvedTickets} />
      </div>

      {loading ? (
        <Card className="p-5 text-sm text-neutral-600 dark:text-neutral-400">Loading agents...</Card>
      ) : agents.length === 0 ? (
        <EmptyState
          description="Create support agents with python -m app.create_agent, then they will appear here."
          icon={Inbox}
          title="No support agents found"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-neutral-950 dark:text-white">{agent.full_name}</h2>
                  <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-neutral-500 dark:text-neutral-400">
                    <Mail size={15} aria-hidden="true" />
                    {agent.email}
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                  {agent.active_ticket_count} active
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <p className="text-lg font-semibold text-neutral-950 dark:text-white">{agent.open_ticket_count}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Open</p>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <p className="text-lg font-semibold text-neutral-950 dark:text-white">{agent.in_progress_ticket_count}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Active</p>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <p className="text-lg font-semibold text-neutral-950 dark:text-white">{agent.resolved_ticket_count}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Resolved</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
