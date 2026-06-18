import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ticketApi, type AdminTicketFilters } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input, Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import type { AgentWorkload, Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
import { categories, priorities, statuses } from "../types";

const pageSize = 8;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default function AdminTickets() {
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

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const filters: AdminTicketFilters = {
      page,
      page_size: pageSize,
      search: search.trim() || undefined,
      status,
      priority,
      category,
      assigned_to_id: assignedToId
    };
    const data = await ticketApi.adminTickets(filters);
    setTickets(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [assignedToId, category, page, priority, search, status]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    ticketApi.adminAgents().then(setAgents);
  }, []);

  async function handleStatus(ticketId: number, nextStatus: TicketStatus) {
    await ticketApi.updateStatus(ticketId, nextStatus);
    await loadTickets();
  }

  async function handlePriority(ticketId: number, nextPriority: TicketPriority) {
    await ticketApi.updatePriority(ticketId, nextPriority);
    await loadTickets();
  }

  async function handleAssign(ticketId: number, value: string) {
    const nextAssignee = value ? Number(value) : null;
    await ticketApi.assignTicket(ticketId, nextAssignee);
    await loadTickets();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={loadTickets} type="button" variant="secondary">
            <PixelIcon name="refresh" size={18} />
            Refresh
          </Button>
        }
        description="Search, triage, assign, and update customer tickets without leaving the queue."
        eyebrow="Admin Tickets"
        title="Manage Support Queue"
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_150px_170px_190px]">
          <div className="relative min-w-0 flex-1">
            <PixelIcon className="pointer-events-none absolute left-3 top-2.5 text-[#726D66]" name="search" size={20} />
            <Input
              className="pl-10"
              placeholder="Search by title, description, or customer"
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
            <option value="">All assignees</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-3 xl:hidden">
        {loading ? (
          <Card className="p-5 text-sm text-[#A7A29A]">Loading tickets...</Card>
        ) : tickets.length === 0 ? (
          <EmptyState
            description="Try adjusting the search or filters to bring more tickets into view."
            title="No tickets match these filters"
          />
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-accent-400">
                    {ticket.category}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-base font-black uppercase text-[#F5F1EA]">{ticket.title}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#A7A29A]">
                    <Avatar size="sm" user={ticket.created_by} />
                    {ticket.created_by.full_name}
                  </p>
                </div>
                <Link className={buttonClassName({ className: "shrink-0 px-3", size: "sm", variant: "secondary" })} to={`/tickets/${ticket.id}`}>
                  <PixelIcon name="eye" size={16} />
                  View
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge value={ticket.status} />
                <PriorityBadge value={ticket.priority} />
                <span className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-black uppercase text-[#F5F1EA]">
                  <PixelIcon name="calendar" size={15} />
                  {formatDate(ticket.created_at)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="truncate text-sm text-[#A7A29A]">
                  Assignee: <span className="font-semibold text-[#F5F1EA]">{ticket.assigned_to?.full_name || "Unassigned"}</span>
                </p>
                <Select
                  className="shrink-0 py-2 text-xs sm:w-52"
                  value={ticket.assigned_to?.id || ""}
                  onChange={(event) => handleAssign(ticket.id, event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden overflow-hidden xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-white/10 bg-[#0B0B0A]/70 text-xs uppercase text-[#726D66]">
            <tr>
              <th className="w-[30%] px-3 py-4 font-semibold">Ticket</th>
              <th className="w-[15%] px-3 py-4 font-semibold">Customer</th>
              <th className="w-[15%] px-3 py-4 font-semibold">Status</th>
              <th className="w-[15%] px-3 py-4 font-semibold">Priority</th>
              <th className="w-[15%] px-3 py-4 font-semibold">Assignee</th>
              <th className="w-[10%] px-3 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td className="px-3 py-10 text-[#A7A29A]" colSpan={6}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td className="px-3 py-10" colSpan={6}>
                  <div className="flex items-center gap-3 text-[#A7A29A]">
                    <PixelIcon name="inbox" size={22} />
                    No tickets match the current filters.
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="align-top transition hover:bg-white/[0.03]">
                  <td className="px-3 py-4">
                    <p className="truncate font-black uppercase text-[#F5F1EA]">{ticket.title}</p>
                    <p className="mt-1 truncate text-xs text-[#A7A29A]">
                      {ticket.category} - {formatDate(ticket.created_at)}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="flex min-w-0 items-center gap-2 truncate text-[#F5F1EA]">
                      <Avatar size="sm" user={ticket.created_by} />
                      <span className="truncate">{ticket.created_by.full_name}</span>
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <div className="mb-2">
                      <StatusBadge value={ticket.status} />
                    </div>
                    <Select className="py-2 text-xs" value={ticket.status} onChange={(event) => handleStatus(ticket.id, event.target.value as TicketStatus)}>
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <div className="mb-2">
                      <PriorityBadge value={ticket.priority} />
                    </div>
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
                  </td>
                  <td className="px-3 py-4">
                    <p className="mb-2 flex min-w-0 items-center gap-2 truncate text-[#F5F1EA]">
                      {ticket.assigned_to && <Avatar size="sm" user={ticket.assigned_to} />}
                      <span className="truncate">{ticket.assigned_to?.full_name || "Unassigned"}</span>
                    </p>
                    <div className="relative">
                      <PixelIcon className="pointer-events-none absolute left-2.5 top-2.5 text-[#726D66]" name="user" size={16} />
                      <Select
                        className="py-2 pl-8 text-xs"
                        value={ticket.assigned_to?.id || ""}
                        onChange={(event) => handleAssign(ticket.id, event.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.full_name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Link className={buttonClassName({ className: "px-2.5", size: "sm", variant: "secondary" })} to={`/tickets/${ticket.id}`}>
                      <PixelIcon name="eye" size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#A7A29A]">
          Page {page} of {totalPages} - {total} tickets
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
