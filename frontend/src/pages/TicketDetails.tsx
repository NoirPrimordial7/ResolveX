import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { useAuth } from "../context/AuthContext";
import type { Ticket } from "../types";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const id = Number(ticketId);
  const backHref = user?.role === "admin" ? "/admin/tickets" : "/dashboard";

  async function loadTicket() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ticketApi.ticketDetails(id);
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || !ticket) return;
    setError("");
    setSubmitting(true);
    try {
      await ticketApi.addComment(ticket.id, message);
      setMessage("");
      await loadTicket();
    } catch {
      setError("Comment could not be added.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-400">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="panel-card rounded-sm p-8 text-center">
        <p className="text-lg font-semibold text-white">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link className="secondary-button" to={backHref}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </Link>

      <article className="panel-card rounded-sm p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">{ticket.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{ticket.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-300">{ticket.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TicketStatusBadge value={ticket.status} />
            <TicketStatusBadge value={ticket.priority} type="priority" />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 rounded-sm border border-neutral-800 bg-[#080808] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-neutral-500">Created By</dt>
            <dd className="mt-1 text-sm font-semibold text-white">{ticket.created_by.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-neutral-500">Assigned To</dt>
            <dd className="mt-1 text-sm font-semibold text-white">{ticket.assigned_to?.full_name || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-neutral-500">Created</dt>
            <dd className="mt-1 text-sm font-semibold text-white">{new Date(ticket.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-neutral-500">Updated</dt>
            <dd className="mt-1 text-sm font-semibold text-white">{new Date(ticket.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </article>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-orange-400" size={22} aria-hidden="true" />
          <h2 className="text-xl font-bold text-white">Comments</h2>
        </div>

        <div className="space-y-3">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment) => (
              <div key={comment.id} className="panel-card rounded-sm p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-white">
                    {comment.author.full_name}{" "}
                    <span className="text-xs capitalize text-neutral-500">({comment.author.role})</span>
                  </p>
                  <p className="text-xs text-neutral-500">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{comment.message}</p>
              </div>
            ))
          ) : (
            <div className="panel-card rounded-sm p-6 text-sm text-neutral-400">No comments yet.</div>
          )}
        </div>

        <form className="panel-card rounded-sm p-4" onSubmit={handleComment}>
          <label className="label" htmlFor="message">
            Add comment
          </label>
          <textarea
            className="field mt-2 min-h-28 resize-y"
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
          {error && <p className="mt-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button className="primary-button mt-4" disabled={submitting} type="submit">
            <Send size={18} aria-hidden="true" />
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </section>
    </div>
  );
}
