import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Inbox, RotateCcw, Search, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi, type AdminTicketFilters } from "../api/ticketApi";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Input, Select } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
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
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const filters: AdminTicketFilters = {
      page,
      page_size: pageSize,
      search: search.trim() || undefined,
      status,
      priority,
      category
    };
    const data = await ticketApi.adminTickets(filters);
    setTickets(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [category, page, priority, search, status]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function handleStatus(ticketId: number, nextStatus: TicketStatus) {
    await ticketApi.updateStatus(ticketId, nextStatus);
    await loadTickets();
  }

  async function handlePriority(ticketId: number, nextPriority: TicketPriority) {
    await ticketApi.updatePriority(ticketId, nextPriority);
    await loadTickets();
  }

  async function handleAssign(ticketId: number) {
    await ticketApi.assignToSelf(ticketId);
    await loadTickets();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={loadTickets} type="button" variant="secondary">
            <RotateCcw size={17} aria-hidden="true" />
            Refresh
          </Button>
        }
        description="Search, triage, assign, and update customer tickets without leaving the queue."
        eyebrow="Admin Tickets"
        title="Manage Support Queue"
      />

      <Card className="p-4">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={18} />
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
        </div>
      </Card>

      <div className="grid gap-3 lg:hidden">
        {loading ? (
          <Card className="p-5 text-sm text-neutral-600 dark:text-neutral-400">Loading tickets...</Card>
        ) : tickets.length === 0 ? (
          <EmptyState
            description="Try adjusting the search or filters to bring more tickets into view."
            icon={Inbox}
            title="No tickets match these filters"
          />
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                    {ticket.category}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-base font-semibold text-neutral-950 dark:text-white">{ticket.title}</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{ticket.created_by.full_name}</p>
                </div>
                <Link className={buttonClassName({ className: "shrink-0 px-3", size: "sm", variant: "secondary" })} to={`/tickets/${ticket.id}`}>
                  <Eye size={15} aria-hidden="true" />
                  View
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge value={ticket.status} />
                <PriorityBadge value={ticket.priority} />
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <CalendarDays size={13} aria-hidden="true" />
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

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                  Assignee: <span className="font-medium text-neutral-800 dark:text-neutral-200">{ticket.assigned_to?.full_name || "Unassigned"}</span>
                </p>
                <Button className="shrink-0" onClick={() => handleAssign(ticket.id)} size="sm" type="button">
                  <UserCheck size={15} aria-hidden="true" />
                  Assign
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-[0.14em] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-500">
            <tr>
              <th className="w-[30%] px-4 py-4 font-semibold">Ticket</th>
              <th className="w-[16%] px-4 py-4 font-semibold">Customer</th>
              <th className="w-[14%] px-4 py-4 font-semibold">Status</th>
              <th className="w-[14%] px-4 py-4 font-semibold">Priority</th>
              <th className="w-[16%] px-4 py-4 font-semibold">Assignee</th>
              <th className="w-[10%] px-4 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? (
              <tr>
                <td className="px-4 py-10 text-neutral-600 dark:text-neutral-400" colSpan={6}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td className="px-4 py-10" colSpan={6}>
                  <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <Inbox size={20} aria-hidden="true" />
                    No tickets match the current filters.
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="align-top transition hover:bg-neutral-50 dark:hover:bg-neutral-900/70">
                  <td className="px-4 py-4">
                    <p className="truncate font-semibold text-neutral-950 dark:text-white">{ticket.title}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {ticket.category} · {formatDate(ticket.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="truncate text-neutral-700 dark:text-neutral-300">{ticket.created_by.full_name}</p>
                  </td>
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4">
                    <p className="mb-2 truncate text-neutral-700 dark:text-neutral-300">{ticket.assigned_to?.full_name || "Unassigned"}</p>
                    <Button className="px-3" onClick={() => handleAssign(ticket.id)} size="sm" type="button">
                      <UserCheck size={15} aria-hidden="true" />
                      Assign
                    </Button>
                  </td>
                  <td className="px-4 py-4">
                    <Link className={buttonClassName({ className: "px-3", size: "sm", variant: "secondary" })} to={`/tickets/${ticket.id}`}>
                      <Eye size={15} aria-hidden="true" />
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
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Page {page} of {totalPages} · {total} tickets
        </p>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">
            <ChevronLeft size={16} aria-hidden="true" />
            Previous
          </Button>
          <Button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} type="button">
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
