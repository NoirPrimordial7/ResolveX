import api from "./axios";
import type {
  AdminDashboardResponse,
  CreateTicketPayload,
  Ticket,
  TicketCategory,
  TicketListResponse,
  TicketPriority,
  TicketStatus
} from "../types";

export interface AdminTicketFilters {
  page?: number;
  page_size?: number;
  search?: string;
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
  addComment(ticketId: number, message: string) {
    return api.post(`/tickets/${ticketId}/comments`, { message }).then((response) => response.data);
  },
  adminDashboard() {
    return api.get<AdminDashboardResponse>("/admin/dashboard").then((response) => response.data);
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
  assignToSelf(ticketId: number) {
    return api.patch<Ticket>(`/admin/tickets/${ticketId}/assign`, {}).then((response) => response.data);
  }
};
