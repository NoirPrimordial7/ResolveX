import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import ChatThread from "../components/ChatThread";
import EmptyState from "../components/EmptyState";
import PixelIcon from "../components/PixelIcon";
import TicketMetaSidebar from "../components/TicketMetaSidebar";
import { useAuth } from "../context/AuthContext";
import type { CommentAttachment, Ticket } from "../types";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const id = Number(ticketId);
  const backHref =
    user?.role === "admin" ? "/admin/tickets" : user?.role === "support_agent" ? "/agent/tickets" : "/customer/dashboard";

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

  async function handleSend(message: string, attachments: CommentAttachment[]) {
    if (!ticket) return;
    setError("");
    setSubmitting(true);
    try {
      await ticketApi.addComment(ticket.id, message, attachments);
      await loadTicket();
    } catch {
      setError("Message could not be sent.");
      throw new Error("Message could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm text-[#A7A29A]">Loading ticket...</Card>;
  }

  if (!ticket) {
    return (
      <EmptyState
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to={backHref}>
            Back to Tickets
          </Link>
        }
        description="This ticket may have been removed or you may not have access to it."
        title="Ticket not found"
      />
    );
  }

  return (
    <div className="space-y-5">
      <Link className={buttonClassName({ variant: "secondary" })} to={backHref}>
        <PixelIcon className="rotate-180" name="arrow" size={18} />
        Back
      </Link>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TicketMetaSidebar ticket={ticket} />
        <ChatThread
          comments={ticket.comments || []}
          currentUser={user}
          error={error}
          onSend={handleSend}
          submitting={submitting}
          subtitle="Message history, files, and support decisions stay attached to this ticket."
          title={`Ticket #${ticket.id}`}
        />
      </div>
    </div>
  );
}
