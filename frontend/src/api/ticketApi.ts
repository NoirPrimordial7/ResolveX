import api from "./axios";
import type {
  AgentDashboardResponse,
  AgentWorkload,
  AdminDashboardResponse,
  CreateTicketPayload,
  ReassignmentRequest,
  ReassignmentRequestStatus,
  Ticket,
  CommentAttachment,
  TicketCategory,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
  User
} from "../types";

export interface AdminTicketFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  category?: TicketCategory | "";
  assigned_to_id?: number | "";
}

export interface AgentTicketFilters {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  category?: TicketCategory | "";
}

export const ticketApi = {
  createTicket(payload: CreateTicketPayload) {
    return api.post<Ticket>("/tickets", payload).then((response) => response.data);
  },
  myTickets(status?: TicketStatus | "") {
    return api
      .get<Ticket[]>("/tickets/my", { params: status ? { status } : undefined })
      .then((response) => response.data);
  },
  ticketDetails(ticketId: number) {
    return api.get<Ticket>(`/tickets/${ticketId}`).then((response) => response.data);
  },
  addComment(ticketId: number, message: string, attachments: CommentAttachment[] = []) {
    return api.post(`/tickets/${ticketId}/comments`, { message, attachments }).then((response) => response.data);
  },
  agentDashboard() {
    return api.get<AgentDashboardResponse>("/agent/dashboard").then((response) => response.data);
  },
  agentTickets(filters: AgentTicketFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return api.get<Ticket[]>("/agent/tickets", { params }).then((response) => response.data);
  },
  agentTicketDetails(ticketId: number) {
    return api.get<Ticket>(`/agent/tickets/${ticketId}`).then((response) => response.data);
  },
  agentUpdateStatus(ticketId: number, status: TicketStatus) {
    return api.patch<Ticket>(`/agent/tickets/${ticketId}/status`, { status }).then((response) => response.data);
  },
  agentAddComment(ticketId: number, message: string, attachments: CommentAttachment[] = []) {
    return api.post(`/agent/tickets/${ticketId}/comments`, { message, attachments }).then((response) => response.data);
  },
  agentRequestReassignment(ticketId: number, reason: string) {
    return api
      .post<ReassignmentRequest>(`/agent/tickets/${ticketId}/reassignment-requests`, { reason })
      .then((response) => response.data);
  },
  agentDashboard() {
    return api.get<AgentDashboardResponse>("/agent/dashboard").then((response) => response.data);
  },
  agentTickets(filters: AgentTicketFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return api.get<Ticket[]>("/agent/tickets", { params }).then((response) => response.data);
  },
  agentTicketDetails(ticketId: number) {
    return api.get<Ticket>(`/agent/tickets/${ticketId}`).then((response) => response.data);
  },
  agentUpdateStatus(ticketId: number, status: TicketStatus) {
    return api.patch<Ticket>(`/agent/tickets/${ticketId}/status`, { status }).then((response) => response.data);
  },
  agentAddComment(ticketId: number, message: string) {
    return api.post(`/agent/tickets/${ticketId}/comments`, { message }).then((response) => response.data);
  },
  agentRequestReassignment(ticketId: number, reason: string) {
    return api
      .post<ReassignmentRequest>(`/agent/tickets/${ticketId}/reassignment-requests`, { reason })
      .then((response) => response.data);
  },
  agentDashboard() {
    return api.get<AgentDashboardResponse>("/agent/dashboard").then((response) => response.data);
  },
  agentTickets(filters: AgentTicketFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return api.get<Ticket[]>("/agent/tickets", { params }).then((response) => response.data);
  },
  agentTicketDetails(ticketId: number) {
    return api.get<Ticket>(`/agent/tickets/${ticketId}`).then((response) => response.data);
  },
  agentUpdateStatus(ticketId: number, status: TicketStatus) {
    return api.patch<Ticket>(`/agent/tickets/${ticketId}/status`, { status }).then((response) => response.data);
  },
  agentAddComment(ticketId: number, message: string) {
    return api.post(`/agent/tickets/${ticketId}/comments`, { message }).then((response) => response.data);
  },
  agentRequestReassignment(ticketId: number, reason: string) {
    return api
      .post<ReassignmentRequest>(`/agent/tickets/${ticketId}/reassignment-requests`, { reason })
      .then((response) => response.data);
  },
  adminDashboard() {
    return api.get<AdminDashboardResponse>("/admin/dashboard").then((response) => response.data);
  },
  adminUsers() {
    return api.get<User[]>("/admin/users").then((response) => response.data);
  },
  adminAgents() {
    return api.get<AgentWorkload[]>("/admin/agents").then((response) => response.data);
  },
  adminTickets(filters: AdminTicketFilters) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return api.get<TicketListResponse>("/admin/tickets", { params }).then((response) => response.data);
  },
  updateStatus(ticketId: number, status: TicketStatus) {
    return api.patch<Ticket>(`/admin/tickets/${ticketId}/status`, { status }).then((response) => response.data);
  },
  updatePriority(ticketId: number, priority: TicketPriority) {
    return api.patch<Ticket>(`/admin/tickets/${ticketId}/priority`, { priority }).then((response) => response.data);
  },
  assignTicket(ticketId: number, assignedToId: number | null) {
    return api
      .patch<Ticket>(`/admin/tickets/${ticketId}/assign`, { assigned_to_id: assignedToId })
      .then((response) => response.data);
  },
  reassignTicket(ticketId: number, assignedToId: number) {
    return api
      .patch<Ticket>(`/admin/tickets/${ticketId}/reassign`, { assigned_to_id: assignedToId })
      .then((response) => response.data);
  },
  adminReassignmentRequests(status?: ReassignmentRequestStatus | "") {
    return api
      .get<ReassignmentRequest[]>("/admin/reassignment-requests", { params: status ? { status } : undefined })
      .then((response) => response.data);
  },
  resolveReassignmentRequest(
    requestId: number,
    payload: { status: "Approved" | "Rejected"; admin_response?: string; assigned_to_id?: number | null }
  ) {
    return api
      .patch<ReassignmentRequest>(`/admin/reassignment-requests/${requestId}`, payload)
      .then((response) => response.data);
  }
};
