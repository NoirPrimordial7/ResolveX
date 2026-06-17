import { useCallback, useEffect, useState } from "react";
import { Eye, RotateCcw, Search, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi, type AdminTicketFilters } from "../api/ticketApi";
import TicketStatusBadge from "../components/TicketStatusBadge";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "../types";
import { categories, priorities, statuses } from "../types";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [loading, setLoading] = useState(true);
  const pageSize = 8;

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Admin Tickets</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Manage support queue</h1>
        </div>
        <button className="secondary-button" onClick={loadTickets} type="button">
          <RotateCcw size={18} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="panel-card rounded-sm p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 text-neutral-500" size={18} />
            <input
              className="field pl-10"
              placeholder="Search tickets"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
          <select
            className="field"
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
          </select>
          <select
            className="field"
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
          </select>
          <select
            className="field"
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
          </select>
        </div>
      </div>

      <div className="panel-card overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="border-b border-neutral-800 bg-[#080808] text-xs uppercase tracking-[0.14em] text-neutral-500">
              <tr>
                <th className="px-4 py-4">Ticket</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Assignee</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-neutral-400" colSpan={6}>
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-neutral-400" colSpan={6}>
                    No tickets match the current filters.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="align-top transition hover:bg-neutral-900">
                    <td className="px-4 py-4">
                      <p className="max-w-xs truncate font-semibold text-white">{ticket.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">{ticket.category}</p>
                    </td>
                    <td className="px-4 py-4 text-neutral-300">{ticket.created_by.full_name}</td>
                    <td className="px-4 py-4">
                      <select
                        className="field py-2"
                        value={ticket.status}
                        onChange={(event) => handleStatus(ticket.id, event.target.value as TicketStatus)}
                      >
                        {statuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        className="field py-2"
                        value={ticket.priority}
                        onChange={(event) => handlePriority(ticket.id, event.target.value as TicketPriority)}
                      >
                        {priorities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-2">
                        <TicketStatusBadge value={ticket.assigned_to?.full_name || "Unassigned"} />
                      </div>
                      <button className="secondary-button px-3 py-2" onClick={() => handleAssign(ticket.id)} type="button">
                        <UserCheck size={16} aria-hidden="true" />
                        Assign
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <Link className="secondary-button px-3 py-2" to={`/tickets/${ticket.id}`}>
                        <Eye size={16} aria-hidden="true" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-400">
          Page {page} of {totalPages} ({total} tickets)
        </p>
        <div className="flex gap-2">
          <button className="secondary-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <button
            className="secondary-button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
