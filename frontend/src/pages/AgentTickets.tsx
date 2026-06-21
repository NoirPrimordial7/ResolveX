import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ticketApi, type AgentTicketFilters } from "../api/ticketApi";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input, Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
import TicketQueueRow from "../components/TicketQueueRow";
import { useNotifications } from "../context/NotificationContext";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
import { categories, priorities, statuses } from "../types";

const agentStatuses: TicketStatus[] = ["In Progress", "Resolved"];

export default function AgentTickets() {
  const { observeTickets } = useNotifications();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
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
        const filters: AgentTicketFilters = { status, priority, category };
        const data = await ticketApi.agentTickets(filters);
        setTickets(data);
        observeTickets("agent-ticket-list", data, {
          label: "assigned student query",
          ticketPath: (ticket) => `/agent/tickets/${ticket.id}`
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, observeTickets, priority, status]
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

  async function handleStatus(ticketId: number, nextStatus: TicketStatus) {
    const updated = await ticketApi.agentUpdateStatus(ticketId, nextStatus);
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updated } : ticket)));
    await loadTickets(true);
  }

  const visibleTickets = useMemo(() => {
    const pattern = search.trim().toLowerCase();
    if (!pattern) return tickets;
    return tickets.filter((ticket) =>
      [ticket.title, ticket.description, ticket.category, ticket.priority, ticket.status, ticket.created_by.full_name]
        .join(" ")
        .toLowerCase()
        .includes(pattern)
    );
  }, [search, tickets]);

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={() => loadTickets(true)} type="button" variant="secondary">
            <PixelIcon name="refresh" size={18} />
            Refresh
          </Button>
        }
        description={refreshing ? "Refreshing assigned student queue quietly..." : "Filter assigned placement queries and keep statuses moving as work progresses."}
        eyebrow="Faculty Coordinator"
        title="Assigned Student Queries"
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_200px]">
          <div className="relative min-w-0">
            <PixelIcon className="pointer-events-none absolute left-3 top-2.5 text-stone-400 dark:text-[#A7A29A]" name="search" size={20} />
            <Input className="pl-10" placeholder="Search student queries" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as TicketStatus | "")}>
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority | "")}>
            <option value="">All priorities</option>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={category} onChange={(event) => setCategory(event.target.value as TicketCategory | "")}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="p-5 text-sm text-stone-500 dark:text-[#A7A29A]">Loading assigned student queries...</Card>
      ) : visibleTickets.length === 0 ? (
        <EmptyState description="Assigned student queries that match your filters will appear here." title="No assigned queries found" />
      ) : (
        <Card className="overflow-hidden p-0">
          {visibleTickets.map((ticket) => {
            const statusOptions = [ticket.status, ...agentStatuses.filter((item) => item !== ticket.status)];
            return (
              <TicketQueueRow
                actions={
                  <div className="grid gap-2">
                    <Select className="py-2 text-xs" value={ticket.status} onChange={(event) => handleStatus(ticket.id, event.target.value as TicketStatus)}>
                      {statusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                    <Link className={buttonClassName({ size: "sm", variant: "secondary" })} to={`/agent/tickets/${ticket.id}`}>
                      <PixelIcon name="eye" size={16} />
                      Open Query
                    </Link>
                  </div>
                }
                key={ticket.id}
                role="agent"
                ticket={ticket}
                to={`/agent/tickets/${ticket.id}`}
              />
            );
          })}
        </Card>
      )}
    </div>
  );
}
