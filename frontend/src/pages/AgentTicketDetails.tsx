import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Inbox, MessageSquare, Repeat2, Send, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Select, Textarea } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import type { Ticket, TicketStatus } from "../types";

const agentStatuses: TicketStatus[] = ["In Progress", "Resolved"];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AgentTicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const id = Number(ticketId);

  async function loadTicket() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ticketApi.agentTicketDetails(id);
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function handleStatus(nextStatus: TicketStatus) {
    if (!ticket || nextStatus === ticket.status) return;
    setError("");
    const updated = await ticketApi.agentUpdateStatus(ticket.id, nextStatus);
    setTicket(updated);
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || !ticket) return;
    setError("");
    setSubmittingComment(true);
    try {
      await ticketApi.agentAddComment(ticket.id, message);
      setMessage("");
      await loadTicket();
    } catch {
      setError("Comment could not be added.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleReassignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim() || !ticket) return;
    setError("");
    setNotice("");
    setSubmittingRequest(true);
    try {
      await ticketApi.agentRequestReassignment(ticket.id, reason);
      setReason("");
      setNotice("Reassignment request sent to admins.");
    } catch {
      setError("Reassignment request could not be submitted.");
    } finally {
      setSubmittingRequest(false);
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm text-neutral-600 dark:text-neutral-400">Loading ticket...</Card>;
  }

  if (!ticket) {
    return (
      <EmptyState
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to="/agent/tickets">
            Back to Tickets
          </Link>
        }
        description="This ticket may have been reassigned or removed."
        icon={Inbox}
        title="Ticket not found"
      />
    );
  }

  const statusOptions = [ticket.status, ...agentStatuses.filter((status) => status !== ticket.status)];

  return (
    <div className="space-y-6">
      <Link className={buttonClassName({ variant: "secondary" })} to="/agent/tickets">
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </Link>

      <Card className="overflow-hidden">
        <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{ticket.category}</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">{ticket.title}</h1>
              <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                {ticket.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <StatusBadge value={ticket.status} />
              <PriorityBadge value={ticket.priority} />
            </div>
          </div>
        </div>

        <dl className="grid gap-px bg-neutral-100 dark:bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Customer", value: ticket.created_by.full_name, icon: UserRound },
            { label: "Assigned To", value: ticket.assigned_to?.full_name || "Unassigned", icon: UserRound },
            { label: "Created", value: formatDateTime(ticket.created_at), icon: CalendarDays },
            { label: "Updated", value: formatDateTime(ticket.updated_at), icon: Clock3 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white p-4 dark:bg-neutral-900/80">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-500">
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </dt>
                <dd className="mt-2 truncate text-sm font-medium text-neutral-950 dark:text-white">{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <PageHeader
            description="Reply to the customer and keep the ticket history complete."
            eyebrow="Conversation"
            title={`Comments${ticket.comments?.length ? ` (${ticket.comments.length})` : ""}`}
          />

          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        <MessageSquare size={17} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-950 dark:text-white">{comment.author.full_name}</p>
                        <p className="text-xs capitalize text-neutral-500 dark:text-neutral-400">
                          {comment.author.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDateTime(comment.created_at)}</p>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700 dark:text-neutral-300">{comment.message}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Add the first agent reply when you have an update or question."
              icon={MessageSquare}
              title="No comments yet"
            />
          )}

          <Card className="p-5">
            <form onSubmit={handleComment}>
              <label className="label" htmlFor="message">
                Add reply
              </label>
              <Textarea
                className="mt-3 min-h-32 resize-y"
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type your reply..."
                required
              />
              <Button className="mt-4" disabled={submittingComment} type="submit" variant="primary">
                <Send size={18} aria-hidden="true" />
                {submittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Ticket Controls</h2>
            <label className="label mt-4" htmlFor="status">
              Status
            </label>
            <Select id="status" className="mt-2" value={ticket.status} onChange={(event) => handleStatus(event.target.value as TicketStatus)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            {ticket.resolved_at && (
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">Resolved {formatDateTime(ticket.resolved_at)}</p>
            )}
          </Card>

          <Card className="p-5">
            <form onSubmit={handleReassignment}>
              <div className="flex items-center gap-2">
                <Repeat2 className="text-orange-600 dark:text-orange-400" size={18} aria-hidden="true" />
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Request Reassignment</h2>
              </div>
              <Textarea
                className="mt-4 min-h-28 resize-y"
                minLength={5}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why another agent should take this ticket..."
                required
              />
              <Button className="mt-4 w-full" disabled={submittingRequest} type="submit">
                <Repeat2 size={17} aria-hidden="true" />
                {submittingRequest ? "Sending..." : "Send Request"}
              </Button>
            </form>
          </Card>

          {(error || notice) && (
            <Card
              className={`p-4 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {error || notice}
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
