import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import ChatThread from "../components/ChatThread";
import EmptyState from "../components/EmptyState";
import PixelIcon from "../components/PixelIcon";
import TicketMetaSidebar from "../components/TicketMetaSidebar";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { markTicketSeen } from "../hooks/useTicketSeen";
import { useTicketPolling } from "../hooks/useTicketPolling";
import type { Comment, CommentAttachment, Ticket } from "../types";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { markTicketRead } = useNotifications();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const id = Number(ticketId);
  const backHref =
    user?.role === "admin" ? "/admin/tickets" : user?.role === "support_agent" ? "/agent/tickets" : "/customer/dashboard";

  const fetchTicket = useCallback(() => ticketApi.ticketDetails(id), [id]);

  async function loadTicket() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchTicket();
      setTicket(data);
      markTicketSeen(data);
      void markTicketRead(data.id);
    } finally {
      setLoading(false);
    }
  }

  const { refetchTicket, syncing } = useTicketPolling({
    enabled: Boolean(ticket),
    fetchTicket,
    onTicket: markTicketSeen,
    setTicket,
    ticket
  });

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function sendComment(message: string, attachments: CommentAttachment[], retryCommentId?: number) {
    if (!ticket || !user) return;
    setError("");
    setSubmitting(true);
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
      const savedComment = await ticketApi.addComment(ticket.id, message, attachments);
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
      setError("Message could not be sent.");
      throw new Error("Message could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(message: string, attachments: CommentAttachment[]) {
    await sendComment(message, attachments);
  }

  async function handleRetryComment(comment: Comment) {
    await sendComment(comment.message, comment.attachments || [], comment.id);
  }

  if (loading) {
    return <Card className="p-6 text-sm app-text-muted">Loading query...</Card>;
  }

  if (!ticket) {
    return (
      <EmptyState
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to={backHref}>
            Back to Queries
          </Link>
        }
        description="This placement query may have been removed or you may not have access to it."
        title="Query not found"
      />
    );
  }

  return (
    <div className="space-y-5">
      <Link className={buttonClassName({ variant: "secondary" })} to={backHref}>
        <PixelIcon className="rotate-180" name="arrow" size={18} />
        Back
      </Link>

      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TicketMetaSidebar ticket={ticket} />
        <ChatThread
          comments={ticket.comments || []}
          currentUser={user}
          error={error}
          onRetryComment={handleRetryComment}
          onSend={handleSend}
          submitting={submitting}
          syncing={syncing}
          subtitle="Message history, files, and placement support decisions stay attached to this query."
          title={`Query #${ticket.id}`}
        />
      </div>
    </div>
  );
}
