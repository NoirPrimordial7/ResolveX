import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import ChatThread from "../components/ChatThread";
import EmptyState from "../components/EmptyState";
import { Select, Textarea } from "../components/Input";
import PixelIcon from "../components/PixelIcon";
import TicketMetaSidebar from "../components/TicketMetaSidebar";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useTicketPolling } from "../hooks/useTicketPolling";
import type { Comment, CommentAttachment, Ticket, TicketStatus } from "../types";

const agentStatuses: TicketStatus[] = ["In Progress", "Resolved"];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AgentTicketDetails() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { markTicketRead } = useNotifications();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reason, setReason] = useState("");
  const [messageError, setMessageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const id = Number(ticketId);

  const fetchTicket = useCallback(() => ticketApi.agentTicketDetails(id), [id]);

  async function loadTicket() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchTicket();
      setTicket(data);
      void markTicketRead(data.id);
    } finally {
      setLoading(false);
    }
  }

  const { refetchTicket, syncing } = useTicketPolling({
    enabled: Boolean(ticket),
    fetchTicket,
    setTicket,
    ticket
  });

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function handleStatus(nextStatus: TicketStatus) {
    if (!ticket || nextStatus === ticket.status) return;
    setActionError("");
    setNotice("");
    try {
      const updated = await ticketApi.agentUpdateStatus(ticket.id, nextStatus);
      setTicket((current) => (current ? { ...current, ...updated, comments: current.comments || [] } : updated));
      setNotice(`Query moved to ${nextStatus}.`);
    } catch {
      setActionError("Status could not be updated.");
    }
  }

  async function sendComment(message: string, attachments: CommentAttachment[], retryCommentId?: number) {
    if (!ticket || !user) return;
    setMessageError("");
    setSubmittingComment(true);
    const tempId = retryCommentId || -Date.now();
    const optimisticComment: Comment = {
      id: tempId,
      attachments,
      author: user,
      created_at: new Date().toISOString(),
      delivery_status: "sending",
      message
    };

    setTicket((current) => {
      if (!current) return current;
      const currentComments = current.comments || [];
      const nextComments = retryCommentId
        ? currentComments.map((comment) => (comment.id === retryCommentId ? optimisticComment : comment))
        : [...currentComments, optimisticComment];
      return { ...current, comments: nextComments, updated_at: optimisticComment.created_at };
    });

    try {
      const savedComment = await ticketApi.agentAddComment(ticket.id, message, attachments);
      setTicket((current) => {
        if (!current) return current;
        return {
          ...current,
          comments: (current.comments || []).map((comment) => (comment.id === tempId ? savedComment : comment)),
          updated_at: savedComment.created_at
        };
      });
      await refetchTicket();
    } catch {
      setTicket((current) => {
        if (!current) return current;
        return {
          ...current,
          comments: (current.comments || []).map((comment) =>
            comment.id === tempId ? { ...comment, delivery_status: "failed" } : comment
          )
        };
      });
      setMessageError("Message could not be sent.");
      throw new Error("Message could not be sent.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSend(message: string, attachments: CommentAttachment[]) {
    await sendComment(message, attachments);
  }

  async function handleRetryComment(comment: Comment) {
    await sendComment(comment.message, comment.attachments || [], comment.id);
  }

  async function handleReassignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim() || !ticket) return;
    setActionError("");
    setNotice("");
    setSubmittingRequest(true);
    try {
      await ticketApi.agentRequestReassignment(ticket.id, reason);
      setReason("");
      setNotice("Handover request sent to the Placement Head.");
    } catch {
      setActionError("Handover request could not be submitted.");
    } finally {
      setSubmittingRequest(false);
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm app-text-muted">Loading query...</Card>;
  }

  if (!ticket) {
    return (
      <EmptyState
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to="/agent/tickets">
            Back to Tickets
          </Link>
        }
        description="This query may have been handed over or removed."
        title="Query not found"
      />
    );
  }

  const statusOptions = [ticket.status, ...agentStatuses.filter((status) => status !== ticket.status)];

  return (
    <div className="space-y-5">
      <Link className={buttonClassName({ variant: "secondary" })} to="/agent/tickets">
        <PixelIcon className="rotate-180" name="arrow" size={18} />
        Back
      </Link>

      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TicketMetaSidebar customerLabel="Student" ticket={ticket}>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-accent-400">
              <PixelIcon name="settings" size={21} />
              <h2 className="text-xs font-black uppercase app-text-primary">Query controls</h2>
            </div>
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
            {ticket.resolved_at && <p className="mt-3 text-xs app-text-muted">Resolved {formatDateTime(ticket.resolved_at)}</p>}
          </Card>

          <Card className="p-4">
            <form onSubmit={handleReassignment}>
              <div className="flex items-center gap-2">
                <PixelIcon className="text-accent-400" name="repeat" size={21} />
                <h2 className="text-xs font-black uppercase app-text-primary">Request faculty handover</h2>
              </div>
              <Textarea
                className="mt-4 min-h-28 resize-y"
                minLength={5}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why another faculty coordinator should take this query..."
                required
              />
              <Button className="mt-4 w-full" disabled={submittingRequest} type="submit">
                <PixelIcon name="repeat" size={18} />
                {submittingRequest ? "Sending..." : "Send request"}
              </Button>
            </form>
          </Card>

          {(actionError || notice) && (
            <Card
              className={`p-4 text-sm ${
                actionError
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {actionError || notice}
            </Card>
          )}
        </TicketMetaSidebar>

        <ChatThread
          comments={ticket.comments || []}
          currentUser={user}
          error={messageError}
          onRetryComment={handleRetryComment}
          onSend={handleSend}
          submitting={submittingComment}
          subtitle="Use quick replies, attachments, and status context to keep the student moving."
          syncing={syncing}
          title={`Query #${ticket.id}`}
        />
      </div>
    </div>
  );
}
