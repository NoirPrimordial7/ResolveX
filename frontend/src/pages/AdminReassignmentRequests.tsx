import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox, Repeat2, RotateCcw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Avatar from "../components/Avatar";
import Button, { buttonClassName } from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { Select, Textarea } from "../components/Input";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import type { AgentWorkload, ReassignmentRequest, ReassignmentRequestStatus } from "../types";
import { reassignmentStatuses } from "../types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AdminReassignmentRequests() {
  const [requests, setRequests] = useState<ReassignmentRequest[]>([]);
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [status, setStatus] = useState<ReassignmentRequestStatus | "">("Pending");
  const [selectedAgents, setSelectedAgents] = useState<Record<number, string>>({});
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const data = await ticketApi.adminReassignmentRequests(status);
    setRequests(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    ticketApi.adminAgents().then(setAgents);
  }, []);

  const pendingCount = useMemo(() => requests.filter((request) => request.status === "Pending").length, [requests]);

  async function handleDecision(request: ReassignmentRequest, decision: "Approved" | "Rejected") {
    setError("");
    const selectedAgent = selectedAgents[request.id];
    if (decision === "Approved" && !selectedAgent) {
      setError("Choose a new assignee before approving a request.");
      return;
    }
    try {
      await ticketApi.resolveReassignmentRequest(request.id, {
        status: decision,
        admin_response: responses[request.id]?.trim() || undefined,
        assigned_to_id: decision === "Approved" ? Number(selectedAgent) : undefined
      });
      await loadRequests();
    } catch {
      setError("Reassignment request could not be updated.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={loadRequests} type="button" variant="secondary">
            <RotateCcw size={17} aria-hidden="true" />
            Refresh
          </Button>
        }
        description="Review agent handoff requests and reassign approved tickets to another support agent."
        eyebrow="Admin Reassignments"
        title="Reassignment Requests"
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Repeat2 className="text-accent-400" size={20} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#F5F7FB]">{pendingCount} pending in current view</p>
              <p className="text-xs text-[#AAB3C5]">Approve with a new agent or reject with context.</p>
            </div>
          </div>
          <Select
            className="sm:w-56"
            value={status}
            onChange={(event) => setStatus(event.target.value as ReassignmentRequestStatus | "")}
          >
            <option value="">All statuses</option>
            {reassignmentStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </Card>
      )}

      {loading ? (
        <Card className="p-5 text-sm text-[#AAB3C5]">Loading requests...</Card>
      ) : requests.length === 0 ? (
        <EmptyState
          description="Agent reassignment requests matching the selected status will appear here."
          icon={Inbox}
          title="No reassignment requests"
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={request.status} />
                    <span className="text-xs text-[#AAB3C5]">{formatDateTime(request.created_at)}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-[#F5F7FB]">
                    {request.ticket?.title || `Ticket #${request.ticket_id}`}
                  </h2>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#AAB3C5]">
                    <Avatar size="sm" user={request.requested_by} />
                    <span>Requested by {request.requested_by.full_name}</span>
                    {request.current_assignee ? `, current assignee ${request.current_assignee.full_name}` : ""}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#DCE3F2]">{request.reason}</p>
                </div>
                <Link className={buttonClassName({ className: "shrink-0", size: "sm", variant: "secondary" })} to={`/tickets/${request.ticket_id}`}>
                  View Ticket
                </Link>
              </div>

              {request.status === "Pending" ? (
                <form
                  className="mt-5 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto_auto]"
                  onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    handleDecision(request, "Approved");
                  }}
                >
                  <Select
                    value={selectedAgents[request.id] || ""}
                    onChange={(event) => setSelectedAgents((current) => ({ ...current, [request.id]: event.target.value }))}
                    required
                  >
                    <option value="">New assignee</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name} ({agent.active_ticket_count} active)
                      </option>
                    ))}
                  </Select>
                  <Textarea
                    className="min-h-10 resize-y py-2"
                    value={responses[request.id] || ""}
                    onChange={(event) => setResponses((current) => ({ ...current, [request.id]: event.target.value }))}
                    placeholder="Optional admin response"
                  />
                  <Button type="submit" variant="primary">
                    <CheckCircle2 size={17} aria-hidden="true" />
                    Approve
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDecision(request, "Rejected")}>
                    <XCircle size={17} aria-hidden="true" />
                    Reject
                  </Button>
                </form>
              ) : (
                <div className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-[#AAB3C5]">
                  {request.admin_response || "No admin response recorded."}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
