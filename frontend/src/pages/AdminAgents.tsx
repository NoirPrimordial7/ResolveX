import { useEffect, useState } from "react";

import { ticketApi } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
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
        <StatCard description="Active support users" indicator="Team" title="Agents" value={agents.length} />
        <StatCard description="Open or in progress" indicator="Owned" title="Active Tickets" tone="blue" value={activeTickets} />
        <StatCard description="Completed by agents" indicator="Done" title="Resolved Tickets" tone="green" value={resolvedTickets} />
      </div>

      {loading ? (
        <Card className="p-5 text-sm text-[#A7A29A]">Loading agents...</Card>
      ) : agents.length === 0 ? (
        <EmptyState
          description="Create support agents with python -m app.create_agent, then they will appear here."
          title="No support agents found"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={agent} />
                  <div className="min-w-0">
                    <h2 className="truncate text-xs font-black uppercase text-[#F5F1EA]">{agent.full_name}</h2>
                    <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-[#A7A29A]">
                    <PixelIcon name="mail" size={16} />
                    {agent.email}
                  </p>
                  </div>
                </div>
                <span className="rounded-sm bg-accent-500/10 px-2.5 py-1 text-[11px] font-black uppercase text-accent-200">
                  {agent.active_ticket_count} active
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3">
                  <p className="display-type text-3xl leading-none text-[#F5F1EA]">{agent.open_ticket_count}</p>
                  <p className="text-[11px] font-black uppercase text-[#A7A29A]">Open</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3">
                  <p className="display-type text-3xl leading-none text-[#F5F1EA]">{agent.in_progress_ticket_count}</p>
                  <p className="text-[11px] font-black uppercase text-[#A7A29A]">Active</p>
                </div>
                <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3">
                  <p className="display-type text-3xl leading-none text-[#F5F1EA]">{agent.resolved_ticket_count}</p>
                  <p className="text-[11px] font-black uppercase text-[#A7A29A]">Resolved</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
