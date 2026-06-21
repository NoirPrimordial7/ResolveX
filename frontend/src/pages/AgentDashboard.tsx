import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import DashboardChartCard, { ChartEmptyState, ChartTooltip } from "../components/DashboardChartCard";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
import StatCard from "../components/StatCard";
import TicketQueueRow from "../components/TicketQueueRow";
import { useNotifications } from "../context/NotificationContext";
import type { AgentDashboardResponse, Ticket, TicketPriority, TicketStatus } from "../types";
import { priorities, statuses } from "../types";

const priorityChartColors = ["#38BDF8", "#A8A29E", "#F59E0B", "#FF4A2E"];
const statusChartColors = ["#FF4A2E", "#38BDF8", "#10B981", "#A8A29E"];

function countBy<T extends string>(items: Ticket[], values: T[], selector: (ticket: Ticket) => T) {
  const counts = Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;
  items.forEach((ticket) => {
    counts[selector(ticket)] += 1;
  });
  return values.map((value) => ({ name: value, value: counts[value] }));
}

export default function AgentDashboard() {
  const { notificationPath, notifications, observeTickets } = useNotifications();
  const [dashboard, setDashboard] = useState<AgentDashboardResponse | null>(null);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (silent = false) => {
      setRefreshing(silent);
      try {
        const [dashboardData, tickets] = await Promise.all([ticketApi.agentDashboard(), ticketApi.agentTickets()]);
        setDashboard(dashboardData);
        setAssignedTickets(tickets);
        observeTickets("agent-dashboard-assigned", tickets, {
          label: "assigned student query",
          ticketPath: (ticket) => `/agent/tickets/${ticket.id}`
        });
      } finally {
        setRefreshing(false);
      }
    },
    [observeTickets]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadDashboard(true).catch(() => setRefreshing(false));
    }, 25_000);

    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const statusData = useMemo(() => countBy<TicketStatus>(assignedTickets, statuses, (ticket) => ticket.status), [assignedTickets]);
  const priorityData = useMemo(() => countBy<TicketPriority>(assignedTickets, priorities, (ticket) => ticket.priority), [assignedTickets]);
  const recentNotifications = notifications.slice(0, 4);
  const hasStatusData = statusData.some((item) => item.value > 0);
  const hasPriorityData = priorityData.some((item) => item.value > 0);
  const statusTotal = statusData.reduce((total, item) => total + item.value, 0);

  if (!dashboard) {
    return <Card className="p-6 text-sm text-stone-500 dark:text-[#A7A29A]">Loading dashboard...</Card>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/agent/tickets">
            <PixelIcon name="headset" size={18} />
            Open Student Queue
          </Link>
        }
        description={refreshing ? "Refreshing assigned student queries quietly..." : "Work through assigned placement queries, update students, and keep status current."}
        eyebrow="Faculty Coordinator"
        title="Assigned Student Queries"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Student queries assigned to you" indicator="Owned" title="Assigned Queries" value={dashboard.stats.assigned_tickets} />
        <StatCard description="Waiting for first action" indicator="Start next" title="Open Assigned" tone="amber" value={dashboard.stats.open_assigned_tickets} />
        <StatCard description="Currently being handled" indicator="Active" title="In Progress" tone="blue" value={dashboard.stats.in_progress_assigned_tickets} />
        <StatCard description="Resolved by you" indicator="Done" title="Resolved" tone="green" value={dashboard.stats.resolved_tickets} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <DashboardChartCard badge={`${statusTotal} total`} description="Your assigned student queries by status." icon="ticket" title="My Query Status">
          {hasStatusData ? (
            <ResponsiveContainer height="100%" width="100%">
              <PieChart margin={{ bottom: 8, left: 8, right: 8, top: 8 }}>
                <Pie
                  cornerRadius={8}
                  data={statusData}
                  dataKey="value"
                  endAngle={-270}
                  innerRadius={62}
                  isAnimationActive
                  labelLine={false}
                  nameKey="name"
                  outerRadius={96}
                  paddingAngle={5}
                  startAngle={90}
                  stroke="var(--rx-chart-segment-stroke)"
                  strokeWidth={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell fill={statusChartColors[index % statusChartColors.length]} key={entry.name} />
                  ))}
                </Pie>
                <text dominantBaseline="middle" fill="var(--rx-chart-text)" fontSize={28} fontWeight={900} textAnchor="middle" x="50%" y="48%">
                  {statusTotal}
                </text>
                <text dominantBaseline="middle" fill="var(--rx-chart-axis)" fontSize={11} fontWeight={800} textAnchor="middle" x="50%" y="60%">
                  ASSIGNED
                </text>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="Assigned student query status data will appear here." />
          )}
        </DashboardChartCard>

        <DashboardChartCard badge="Active mix" description="Priority mix across your current placement workload." icon="alert" title="Priority Breakdown">
          {hasPriorityData ? (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={priorityData} margin={{ bottom: 4, left: -4, right: 8, top: 16 }}>
                <CartesianGrid stroke="var(--rx-chart-grid)" strokeDasharray="4 8" vertical={false} />
                <XAxis axisLine={false} dataKey="name" tick={{ fill: "var(--rx-chart-axis)", fontSize: 11, fontWeight: 800 }} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tick={{ fill: "var(--rx-chart-axis)", fontSize: 11, fontWeight: 800 }} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--rx-chart-cursor)" }} />
                <Bar background={{ fill: "var(--rx-chart-cursor)", radius: 12 }} barSize={34} dataKey="value" radius={[10, 10, 4, 4]}>
                  {priorityData.map((entry, index) => (
                    <Cell fill={priorityChartColors[index % priorityChartColors.length]} key={entry.name} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="Priority mix will appear once student queries are assigned." />
          )}
        </DashboardChartCard>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">Recent Activity</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-[#A7A29A]">Assigned student query notifications.</p>
            </div>
            <PixelIcon className="text-accent-500" name="alert" size={21} />
          </div>
          <div className="mt-5 space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-[#A7A29A]">Activity appears after assigned student queries refresh or change.</p>
            ) : (
              recentNotifications.map((notification) => (
                <Link
                  className="block rounded-xl border border-orange-200/45 bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition hover:-translate-y-px hover:border-accent-500/35 hover:bg-white/80 hover:shadow-[0_12px_30px_rgba(120,72,30,0.09)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:translate-y-0 dark:hover:bg-accent-500/10"
                  key={notification.id}
                  to={notificationPath(notification) || "/agent/tickets"}
                >
                  <p className="truncate text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500 dark:text-[#A7A29A]">{notification.message}</p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">My Assigned Student Queries</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-[#A7A29A]">Newest updates in your assigned placement workload.</p>
        </div>

        {assignedTickets.length === 0 ? (
          <EmptyState description="Queries assigned by the Placement Head will appear here." title="You're all caught up" />
        ) : (
          <Card className="overflow-hidden p-0">
            {assignedTickets.map((ticket) => (
              <TicketQueueRow key={ticket.id} role="agent" ticket={ticket} to={`/agent/tickets/${ticket.id}`} />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
