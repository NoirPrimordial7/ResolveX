import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input } from "../components/Input";
import PixelIcon from "../components/PixelIcon";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import TicketQueueRow from "../components/TicketQueueRow";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useTicketSeen } from "../hooks/useTicketSeen";
import type { Ticket, TicketStatus } from "../types";
import { statuses } from "../types";
import { cn } from "../utils/cn";

type InboxFilter = "All" | "Unread" | TicketStatus;

const inboxFilters: InboxFilter[] = ["All", "Unread", ...statuses];

function searchableText(ticket: Ticket) {
  return [
    ticket.title,
    ticket.description,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.assigned_to?.full_name,
    ...(ticket.comments || []).map((comment) => comment.message)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatUpdated(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  }).format(date);
}

function progressPercent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { observeTickets } = useNotifications();
  const { isUnread, markSeen } = useTicketSeen();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await ticketApi.myTickets();
        setTickets(data);
        observeTickets("customer-my-tickets", data, {
          label: "student query",
          ticketPath: (ticket) => `/tickets/${ticket.id}`
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [observeTickets]
  );

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadTickets(true).catch(() => setRefreshing(false));
    }, 25_000);

    return () => window.clearInterval(interval);
  }, [loadTickets]);

  const stats = useMemo(
    () => ({
      active: tickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress").length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      resolved: tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length,
      total: tickets.length,
      unread: tickets.filter(isUnread).length
    }),
    [isUnread, tickets]
  );

  const latestTicket = useMemo(
    () =>
      [...tickets].sort(
        (first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
      )[0],
    [tickets]
  );

  const activeQueuePercent = progressPercent(stats.active, stats.total);
  const unreadPercent = progressPercent(stats.unread, stats.total);
  const resolvedPercent = progressPercent(stats.resolved, stats.total);

  const visibleTickets = useMemo(() => {
    const pattern = search.trim().toLowerCase();
    return tickets
      .filter((ticket) => {
        if (filter === "Unread") return isUnread(ticket);
        if (filter === "All") return true;
        return ticket.status === filter;
      })
      .filter((ticket) => (pattern ? searchableText(ticket).includes(pattern) : true))
      .sort((first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime());
  }, [filter, isUnread, search, tickets]);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-orange-200/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.76)_0%,rgba(255,250,242,0.78)_46%,rgba(255,231,203,0.48)_100%)] p-6 shadow-[0_28px_80px_rgba(120,72,30,0.14),0_10px_28px_rgba(249,115,22,0.08)] backdrop-blur-xl dark:rounded-sm dark:border-[#3A332F] dark:bg-[linear-gradient(135deg,#0B0B0A_0%,#14100E_52%,#24100B_100%)] dark:shadow-premium dark:shadow-black/30 dark:backdrop-blur-none md:p-8 xl:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,75,36,0.12),transparent_24rem),radial-gradient(circle_at_16%_8%,rgba(255,190,118,0.24),transparent_22rem),linear-gradient(120deg,rgba(255,255,255,0.50),transparent_44%)] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] dark:[background-size:40px_40px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[linear-gradient(120deg,transparent_0%,rgba(255,75,36,0.06)_58%,rgba(255,75,36,0.12)_100%)] dark:bg-[linear-gradient(120deg,transparent_0%,rgba(255,75,36,0.08)_54%,rgba(255,75,36,0.18)_100%)]" />

        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center xl:gap-6">
          <div className="flex flex-col justify-center py-1 xl:max-w-3xl">
            <p className="eyebrow w-fit">Hi, {user?.full_name || "there"}</p>
            <h1 className="display-type mt-5 max-w-3xl text-5xl leading-[0.94] text-stone-950 dark:text-[#F5F1EA] sm:text-6xl xl:text-7xl">
              Need placement support?
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 dark:text-[#A7A29A]">
              Raise a placement query, track faculty replies, and keep your full conversation history in one place.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <Link className={buttonClassName({ className: "w-full sm:w-auto", variant: "primary" })} to="/tickets/new">
                <PixelIcon name="plus" size={18} />
                Raise Placement Query
              </Link>
              <a className={buttonClassName({ className: "w-full sm:w-auto", variant: "secondary" })} href="#ticket-inbox">
                <PixelIcon name="inbox" size={18} />
                View My Queries
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200/40 bg-white/68 p-5 shadow-[0_24px_70px_rgba(120,72,30,0.16),0_8px_24px_rgba(249,115,22,0.08)] backdrop-blur-xl dark:rounded-none dark:border-[#5A2B20] dark:bg-[linear-gradient(135deg,#1A1210_0%,#101010_55%,#2A0F09_100%)] dark:shadow-black/35 dark:backdrop-blur-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase text-orange-700 dark:text-accent-300">Placement Support Snapshot</p>
                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-[#A7A29A]">Your current query queue</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_10px_24px_rgba(120,72,30,0.08)] dark:rounded-sm dark:border-accent-500/35 dark:text-accent-300 dark:shadow-none">
                <PixelIcon name="headset" size={22} />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {[
                { label: "Open", value: stats.open },
                { label: "Unread", value: stats.unread, accent: true },
                { label: "Resolved", value: stats.resolved }
              ].map((item) => (
                <div
                  className={cn(
                    "min-w-0 rounded-2xl border p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_22px_rgba(120,72,30,0.06)] dark:rounded-sm dark:shadow-none",
                    item.accent
                      ? "border-accent-500/40 bg-accent-500/10 dark:border-accent-500/35 dark:bg-accent-500/10"
                      : "border-orange-200/45 bg-white/70 dark:border-white/10 dark:bg-[#0B0B0A]/75"
                  )}
                  key={item.label}
                >
                  <p
                    className={cn(
                      "display-type text-4xl leading-none",
                      item.accent ? "text-orange-700 dark:text-accent-300" : "text-stone-950 dark:text-[#F5F1EA]"
                    )}
                  >
                    {item.value}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-black uppercase text-stone-500 dark:text-[#A7A29A]">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-orange-200/40 bg-white/68 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_26px_rgba(120,72,30,0.07)] dark:rounded-sm dark:border-white/10 dark:bg-[#0B0B0A]/75 dark:shadow-none">
              {latestTicket ? (
                <Link className="block min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35" onClick={() => markSeen(latestTicket)} to={`/tickets/${latestTicket.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-stone-500 dark:text-[#A7A29A]">Latest activity</p>
                      <p className="mt-1 line-clamp-2 text-sm font-black uppercase leading-5 text-stone-950 dark:text-[#F5F1EA]">
                        {latestTicket.title}
                      </p>
                    </div>
                    <StatusBadge className="shrink-0" value={latestTicket.status} />
                  </div>

                  <div className="mt-4 grid gap-3 text-xs text-stone-600 dark:text-[#C4BFB7] sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-stone-400 dark:text-[#A7A29A]">Assigned faculty</p>
                      <p className="mt-1 truncate font-semibold text-stone-800 dark:text-[#F5F1EA]">
                        {latestTicket.assigned_to?.full_name || "Unassigned faculty"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-stone-400 dark:text-[#A7A29A]">Last updated</p>
                      <p className="mt-1 flex items-center gap-1.5 font-semibold text-stone-800 dark:text-[#F5F1EA]">
                        <PixelIcon name="clock" size={15} />
                        {formatUpdated(latestTicket.updated_at || latestTicket.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="py-1.5">
                  <p className="text-sm font-black uppercase text-stone-950 dark:text-[#F5F1EA]">No active queries yet</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-[#A7A29A]">
                    Raise your first placement query to get started.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-orange-200/40 bg-white/52 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_26px_rgba(120,72,30,0.06)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
              {[
                { label: "Active queries", value: stats.active, total: stats.total, percent: activeQueuePercent, className: "bg-accent-500" },
                { label: "Replies", value: stats.unread, total: stats.total, percent: unreadPercent, className: "bg-orange-400 dark:bg-accent-300" },
                { label: "Closed/resolved", value: stats.resolved, total: stats.total, percent: resolvedPercent, className: "bg-emerald-500" }
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase text-stone-500 dark:text-[#A7A29A]">
                    <span>{item.label}</span>
                    <span>
                      {item.value}/{item.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-orange-100/90 shadow-inner dark:rounded-sm dark:bg-black/45">
                    <div className={cn("h-full transition-[width]", item.className)} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard description="Still awaiting faculty closure" indicator="Active" title="Open Queries" tone="amber" value={stats.open} />
        <StatCard description="Updated since you last opened them" indicator="New reply" title="Waiting for Reply" value={stats.unread} />
        <StatCard description="Resolved or closed placement queries" indicator="Done" title="Resolved Queries" tone="green" value={stats.resolved} />
      </div>

      <section className="space-y-4" id="ticket-inbox">
        <Card className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xs font-black uppercase text-stone-950 dark:text-[#F5F1EA]">My Queries</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-[#A7A29A]">
                {refreshing ? "Refreshing quietly..." : "Search and filter your placement support conversations."}
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-[minmax(240px,1fr)_auto] lg:w-[600px]">
              <div className="relative">
                <PixelIcon className="pointer-events-none absolute left-3 top-2.5 text-stone-400 dark:text-[#A7A29A]" name="search" size={20} />
                <Input
                  className="h-11 pl-10"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search queries..."
                  value={search}
                />
              </div>
              <Link className={buttonClassName({ className: "whitespace-nowrap", variant: "primary" })} to="/tickets/new">
                <PixelIcon name="plus" size={18} />
                New Query
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {inboxFilters.map((item) => {
              const active = filter === item;
              return (
                <button
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-black uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm",
                    active
                      ? "border-accent-500/45 bg-accent-500/15 text-orange-700 dark:text-accent-200"
                      : "border-orange-200/80 bg-white/60 text-stone-500 hover:border-accent-500/35 hover:bg-accent-500/10 hover:text-stone-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#A7A29A] dark:hover:text-[#F5F1EA]"
                  )}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              );
            })}
          </div>
        </Card>

        {loading ? (
          <Card className="p-5 text-sm text-stone-500 dark:text-[#A7A29A]">Loading queries...</Card>
        ) : visibleTickets.length === 0 ? (
          <EmptyState
            action={
              <Link className={buttonClassName({ variant: "primary" })} to="/tickets/new">
                <PixelIcon name="plus" size={18} />
                Raise Query
              </Link>
            }
            description="Raise a placement query when you need help from a faculty coordinator. Matching queries will appear here."
            title={tickets.length === 0 ? "You're all caught up" : "No queries match this view"}
          />
        ) : (
          <Card className="overflow-hidden p-0">
            {visibleTickets.map((ticket) => (
              <TicketQueueRow
                key={ticket.id}
                onOpen={() => markSeen(ticket)}
                ticket={ticket}
                to={`/tickets/${ticket.id}`}
                unread={isUnread(ticket)}
              />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
