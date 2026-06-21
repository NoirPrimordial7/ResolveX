import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ticketApi, type AdminTicketFilters } from "../api/ticketApi";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input, Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
import TicketQueueRow from "../components/TicketQueueRow";
import { useNotifications } from "../context/NotificationContext";
import type { AgentWorkload, Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
import { categories, priorities, statuses } from "../types";

const pageSize = 8;

export default function AdminTickets() {
  const { observeTickets } = useNotifications();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [assignedToId, setAssignedToId] = useState<number | "">("");
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: AdminTicketFilters = {
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        status,
        priority,
        category,
        assigned_to_id: assignedToId
      };

      try {
        const data = await ticketApi.adminTickets(filters);
        setTickets(data.items);
        setTotal(data.total);
        observeTickets("admin-ticket-list", data.items, {
          label: "placement query",
          ticketPath: (ticket) => `/tickets/${ticket.id}`
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [assignedToId, category, observeTickets, page, priority, search, status]
  );

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadTickets(true).catch(() => setRefreshing(false));
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [loadTickets]);

  useEffect(() => {
    ticketApi.adminAgents().then(setAgents);
  }, []);

  async function handleStatus(ticketId: number, nextStatus: TicketStatus) {
    const updated = await ticketApi.updateStatus(ticketId, nextStatus);
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updated } : ticket)));
    await loadTickets(true);
  }

  async function handlePriority(ticketId: number, nextPriority: TicketPriority) {
    const updated = await ticketApi.updatePriority(ticketId, nextPriority);
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updated } : ticket)));
    await loadTickets(true);
  }

  async function handleAssign(ticketId: number, value: string) {
    const nextAssignee = value ? Number(value) : null;
    const updated = await ticketApi.assignTicket(ticketId, nextAssignee);
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updated } : ticket)));
    await loadTickets(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={() => loadTickets(true)} type="button" variant="secondary">
            <PixelIcon name="refresh" size={18} />
            Refresh
          </Button>
        }
        description={refreshing ? "Refreshing queue quietly..." : "Search, triage, assign, and update student placement queries without leaving the queue."}
        eyebrow="Placement Head Queue"
        title="Manage Placement Support Queue"
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_150px_170px_190px]">
          <div className="relative min-w-0 flex-1">
            <PixelIcon className="pointer-events-none absolute left-3 top-2.5 text-stone-400 dark:text-[#A7A29A]" name="search" size={20} />
            <Input
              className="pl-10"
              placeholder="Search by title, description, or student"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
          <Select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as TicketStatus | "");
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={priority}
            onChange={(event) => {
              setPage(1);
              setPriority(event.target.value as TicketPriority | "");
            }}
          >
            <option value="">All priorities</option>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value as TicketCategory | "");
            }}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={assignedToId}
            onChange={(event) => {
              setPage(1);
              setAssignedToId(event.target.value ? Number(event.target.value) : "");
            }}
          >
            <option value="">All faculty coordinators</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="p-5 text-sm text-stone-500 dark:text-[#A7A29A]">Loading placement queries...</Card>
      ) : tickets.length === 0 ? (
        <EmptyState description="Try adjusting the search or filters to bring more placement queries into view." title="No queries match these filters" />
      ) : (
        <Card className="overflow-hidden p-0">
          {tickets.map((ticket) => (
            <TicketQueueRow
              actions={
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <Select className="py-2 text-xs" value={ticket.status} onChange={(event) => handleStatus(ticket.id, event.target.value as TicketStatus)}>
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                  <Select
                    className="py-2 text-xs"
                    value={ticket.priority}
                    onChange={(event) => handlePriority(ticket.id, event.target.value as TicketPriority)}
                  >
                    {priorities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                  <Select
                    className="py-2 text-xs sm:col-span-2 xl:col-span-1 2xl:col-span-2"
                    value={ticket.assigned_to?.id || ""}
                    onChange={(event) => handleAssign(ticket.id, event.target.value)}
                  >
                    <option value="">Unassigned faculty</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name}
                      </option>
                    ))}
                  </Select>
                  <Link
                    className={buttonClassName({
                      className: "sm:col-span-2 xl:col-span-1 2xl:col-span-2",
                      size: "sm",
                      variant: "secondary"
                    })}
                    to={`/tickets/${ticket.id}`}
                  >
                    <PixelIcon name="eye" size={16} />
                    Open Query
                  </Link>
                </div>
              }
              key={ticket.id}
              role="admin"
              ticket={ticket}
              to={`/tickets/${ticket.id}`}
            />
          ))}
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500 dark:text-[#A7A29A]">
          Page {page} of {totalPages} - {total} queries
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button className="w-full sm:w-auto" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">
            <PixelIcon className="rotate-180" name="arrow" size={16} />
            Previous
          </Button>
          <Button className="w-full sm:w-auto" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} type="button">
            Next
            <PixelIcon name="arrow" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
