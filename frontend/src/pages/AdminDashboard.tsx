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
import type { AdminDashboardResponse, Ticket, TicketPriority, TicketStatus } from "../types";
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

export default function AdminDashboard() {
  const { notificationPath, notifications, observeTickets } = useNotifications();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [chartTickets, setChartTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (silent = false) => {
      setRefreshing(silent);
      try {
        const data = await ticketApi.adminDashboard();
        setDashboard(data);
        observeTickets("admin-dashboard-recent", data.recent_tickets, {
          label: "placement query",
          ticketPath: (ticket) => `/tickets/${ticket.id}`
        });

        const ticketData = await ticketApi.adminTickets({ page: 1, page_size: 100 });
        setChartTickets(ticketData.items);
        observeTickets("admin-dashboard-sample", ticketData.items, {
          label: "placement query",
          ticketPath: (ticket) => `/tickets/${ticket.id}`
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
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const statusData = useMemo(() => {
    if (!dashboard) return [];
    const counts: Record<TicketStatus, number> = {
      Open: dashboard.stats.open_tickets,
      "In Progress": dashboard.stats.in_progress_tickets,
      Resolved: dashboard.stats.resolved_tickets,
      Closed: dashboard.stats.closed_tickets
    };
    return statuses.map((status) => ({ name: status, value: counts[status] }));
  }, [dashboard]);

  const priorityData = useMemo(() => countBy<TicketPriority>(chartTickets, priorities, (ticket) => ticket.priority), [chartTickets]);

  const workloadData = useMemo(
    () =>
      (dashboard?.agent_workload || []).map((agent) => ({
        active: agent.active_ticket_count,
        name: agent.full_name.split(" ")[0] || agent.email
      })),
    [dashboard]
  );

  const recentNotifications = notifications.slice(0, 4);
  const hasStatusData = statusData.some((item) => item.value > 0);
  const hasPriorityData = priorityData.some((item) => item.value > 0);
  const hasWorkloadData = workloadData.some((item) => item.active > 0);
  const statusTotal = statusData.reduce((total, item) => total + item.value, 0);

  if (!dashboard) {
    return <Card className="p-6 text-sm text-stone-500 dark:text-[#A7A29A]">Loading dashboard...</Card>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link className={buttonClassName({ variant: "primary" })} to="/admin/tickets">
            Manage Queue
            <PixelIcon name="arrow" size={18} />
          </Link>
        }
        description={refreshing ? "Refreshing dashboard quietly..." : "Monitor placement query health, faculty ownership, and deadline pressure from one focused control center."}
        eyebrow="Placement Head"
        title="Manage Placement Support Queue"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard description="All student placement queries" indicator="Live" title="Total Queries" value={dashboard.stats.total_tickets} />
        <StatCard description="Awaiting first action" indicator="Needs triage" title="Open" tone="amber" value={dashboard.stats.open_tickets} />
        <StatCard description="Currently owned" indicator="Active" title="In Progress" tone="blue" value={dashboard.stats.in_progress_tickets} />
        <StatCard description="Completed queries" indicator="Healthy" title="Resolved" tone="green" value={dashboard.stats.resolved_tickets} />
        <StatCard description="Needs assignment" indicator="Queue" title="Unassigned" tone="red" value={dashboard.stats.unassigned_tickets} />
        <StatCard
          description="Faculty handover requests"
          indicator="Pending"
          title="Pending Handovers"
          tone="amber"
          value={dashboard.stats.pending_reassignment_requests}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <DashboardChartCard badge={`${statusTotal} total`} description="Open, active, resolved, and closed placement workload." icon="ticket" title="Query Status">
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
                  QUERIES
                </text>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="Query status data will appear after students raise queries." />
          )}
        </DashboardChartCard>

        <DashboardChartCard badge="Sample" description="Based on the latest Placement Head query sample." icon="alert" title="Priority Breakdown">
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
            <ChartEmptyState message="Priority distribution will appear when placement queries exist." />
          )}
        </DashboardChartCard>

        <DashboardChartCard badge="Faculty" description="Active assigned queries by faculty coordinator." icon="users" title="Faculty Workload">
          {hasWorkloadData ? (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ bottom: 4, left: 8, right: 16, top: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--rx-chart-grid)" strokeDasharray="4 8" />
                <XAxis allowDecimals={false} axisLine={false} tick={{ fill: "var(--rx-chart-axis)", fontSize: 11, fontWeight: 800 }} tickLine={false} type="number" />
                <YAxis axisLine={false} dataKey="name" tick={{ fill: "var(--rx-chart-axis)", fontSize: 11, fontWeight: 800 }} tickLine={false} type="category" width={84} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--rx-chart-cursor)" }} />
                <Bar background={{ fill: "var(--rx-chart-cursor)", radius: 12 }} barSize={24} dataKey="active" fill="#FF4A2E" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="Faculty workload will populate once queries are assigned." />
          )}
        </DashboardChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">Recent Placement Queries</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-[#A7A29A]">Newest student placement issues entering the queue.</p>
          </div>
          {dashboard.recent_tickets.length === 0 ? (
            <EmptyState
              action={
                <Link className={buttonClassName({ variant: "secondary" })} to="/admin/tickets">
                  View Query Queue
                </Link>
              }
              description="New student placement queries will appear here as soon as they are created."
              title="No queries created yet"
            />
          ) : (
            <Card className="overflow-hidden p-0">
              {dashboard.recent_tickets.map((ticket) => (
                <TicketQueueRow key={ticket.id} role="admin" ticket={ticket} to={`/tickets/${ticket.id}`} />
              ))}
            </Card>
          )}
        </section>

        <Card className="h-fit p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">Recent Activity</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-[#A7A29A]">Placement support notifications from queue changes.</p>
            </div>
            <PixelIcon className="text-accent-500" name="alert" size={21} />
          </div>
          <div className="mt-5 space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-[#A7A29A]">Activity appears after placement query lists refresh or change.</p>
            ) : (
              recentNotifications.map((notification) => (
                <Link
                  className="block rounded-xl border border-orange-200/45 bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition hover:-translate-y-px hover:border-accent-500/35 hover:bg-white/80 hover:shadow-[0_12px_30px_rgba(120,72,30,0.09)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:translate-y-0 dark:hover:bg-accent-500/10"
                  key={notification.id}
                  to={notificationPath(notification) || "/admin/tickets"}
                >
                  <p className="truncate text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500 dark:text-[#A7A29A]">{notification.message}</p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
