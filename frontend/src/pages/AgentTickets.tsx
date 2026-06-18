import { useCallback, useEffect, useState } from "react";
import { Eye, Inbox, RotateCcw, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi, type AgentTicketFilters } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input, Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import TicketCard from "../components/TicketCard";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
import { categories, priorities, statuses } from "../types";

export default function AgentTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const filters: AgentTicketFilters = { status, priority, category };
    const data = await ticketApi.agentTickets(filters);
    setTickets(data);
    setLoading(false);
  }, [category, priority, status]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function handleStatus(ticketId: number, nextStatus: TicketStatus) {
    await ticketApi.agentUpdateStatus(ticketId, nextStatus);
    await loadTickets();
  }

  const visibleTickets = tickets.filter((ticket) => {
    const pattern = search.trim().toLowerCase();
    if (!pattern) return true;
    return (
      ticket.title.toLowerCase().includes(pattern) ||
      ticket.description.toLowerCase().includes(pattern) ||
      ticket.created_by.full_name.toLowerCase().includes(pattern)
    );
  });

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={loadTickets} type="button" variant="secondary">
            <RotateCcw size={17} aria-hidden="true" />
            Refresh
          </Button>
        }
        description="Filter your assigned queue and keep statuses moving as work progresses."
        eyebrow="Agent Tickets"
        title="Assigned Tickets"
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_200px]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-3 text-[#6F7A91]" size={18} />
            <Input
              className="pl-10"
              placeholder="Search assigned tickets"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
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
        <Card className="p-5 text-sm text-[#AAB3C5]">Loading assigned tickets...</Card>
      ) : visibleTickets.length === 0 ? (
        <EmptyState
          description="Assigned tickets that match your filters will appear here."
          icon={Inbox}
          title="No assigned tickets found"
        />
      ) : (
        <>
          <div className="grid gap-4 xl:hidden">
            {visibleTickets.map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-accent-400">
                      {ticket.category}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-base font-semibold text-[#F5F7FB]">{ticket.title}</h2>
                    <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-[#AAB3C5]">
                      <Avatar size="sm" user={ticket.created_by} />
                      <span className="truncate">{ticket.created_by.full_name}</span>
                    </p>
                  </div>
                  <Link
                    className={buttonClassName({ className: "shrink-0 px-3", size: "sm", variant: "secondary" })}
                    to={`/agent/tickets/${ticket.id}`}
                  >
                    <Eye size={15} aria-hidden="true" />
                    View
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge value={ticket.status} />
                  <PriorityBadge value={ticket.priority} />
                </div>
                <Select
                  className="mt-4 py-2 text-xs"
                  value={ticket.status}
                  onChange={(event) => handleStatus(ticket.id, event.target.value as TicketStatus)}
                >
                  <option value={ticket.status}>{ticket.status}</option>
                  {["In Progress", "Resolved"]
                    .filter((item) => item !== ticket.status)
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </Select>
              </Card>
            ))}
          </div>

          <div className="hidden grid-cols-2 gap-4 xl:grid">
            {visibleTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} to={`/agent/tickets/${ticket.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
