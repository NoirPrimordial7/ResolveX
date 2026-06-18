import { FormEvent, useEffect, useState } from "react";
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
import type { CommentAttachment, Ticket, TicketStatus } from "../types";

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
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reason, setReason] = useState("");
  const [messageError, setMessageError] = useState("");
  const [actionError, setActionError] = useState("");
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
    setActionError("");
    setNotice("");
    try {
      const updated = await ticketApi.agentUpdateStatus(ticket.id, nextStatus);
      setTicket(updated);
      setNotice(`Ticket moved to ${nextStatus}.`);
    } catch {
      setActionError("Status could not be updated.");
    }
  }

  async function handleSend(message: string, attachments: CommentAttachment[]) {
    if (!ticket) return;
    setMessageError("");
    setSubmittingComment(true);
    try {
      await ticketApi.agentAddComment(ticket.id, message, attachments);
      await loadTicket();
    } catch {
      setMessageError("Message could not be sent.");
      throw new Error("Message could not be sent.");
    } finally {
      setSubmittingComment(false);
    }
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
      setNotice("Reassignment request sent to admins.");
    } catch {
      setActionError("Reassignment request could not be submitted.");
    } finally {
      setSubmittingRequest(false);
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm text-[#A7A29A]">Loading ticket...</Card>;
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
        title="Ticket not found"
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

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TicketMetaSidebar customerLabel="Requester" ticket={ticket}>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-accent-400">
              <PixelIcon name="settings" size={21} />
              <h2 className="text-xs font-black uppercase text-[#F5F1EA]">Ticket controls</h2>
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
            {ticket.resolved_at && <p className="mt-3 text-xs text-[#A7A29A]">Resolved {formatDateTime(ticket.resolved_at)}</p>}
          </Card>

          <Card className="p-4">
            <form onSubmit={handleReassignment}>
              <div className="flex items-center gap-2">
                <PixelIcon className="text-accent-400" name="repeat" size={21} />
                <h2 className="text-xs font-black uppercase text-[#F5F1EA]">Request reassignment</h2>
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
                <PixelIcon name="repeat" size={18} />
                {submittingRequest ? "Sending..." : "Send request"}
              </Button>
            </form>
          </Card>

          {(actionError || notice) && (
            <Card
              className={`p-4 text-sm ${
                actionError
                  ? "border-red-500/25 bg-red-500/10 text-red-200"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
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
          onSend={handleSend}
          submitting={submittingComment}
          subtitle="Use quick replies, attachments, and status context to keep the customer moving."
          title={`Ticket #${ticket.id}`}
        />
      </div>
    </div>
  );
}
