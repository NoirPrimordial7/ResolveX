export type UserRole = "customer" | "support_agent" | "admin";
export type TicketCategory = "Technical" | "Billing" | "Account" | "General" | "Other";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type ReassignmentRequestStatus = "Pending" | "Approved" | "Rejected";
export type NotificationType =
  | "ticket_created"
  | "ticket_updated"
  | "status_changed"
  | "assignment_changed"
  | "comment_added"
  | "priority_changed"
  | "reassignment_requested"
  | "reassignment_approved"
  | "reassignment_rejected";

export interface User {
  id: number;
  name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string | null;
}

export interface Comment {
  id: number;
  message: string;
  attachments?: CommentAttachment[];
  created_at: string;
  author: User;
  delivery_status?: "sending" | "failed";
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: User;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  comments?: Comment[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminDashboardStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  unassigned_tickets: number;
  pending_reassignment_requests: number;
  high_priority_tickets: number;
}

export interface AgentWorkload {
  id: number;
  name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  active_ticket_count: number;
  open_ticket_count: number;
  in_progress_ticket_count: number;
  resolved_ticket_count: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  recent_tickets: Ticket[];
  agent_workload: AgentWorkload[];
}

export interface AgentDashboardStats {
  assigned_tickets: number;
  open_assigned_tickets: number;
  in_progress_assigned_tickets: number;
  resolved_tickets: number;
}

export interface AgentDashboardResponse {
  stats: AgentDashboardStats;
  recent_tickets: Ticket[];
}

export interface ReassignmentRequest {
  id: number;
  ticket_id: number;
  requested_by: User;
  current_assignee: User | null;
  reason: string;
  status: ReassignmentRequestStatus;
  admin_response: string | null;
  created_at: string;
  resolved_at: string | null;
  ticket: Ticket | null;
}

export interface ResolveXNotification {
  id: number;
  user_id: number;
  actor_id: number | null;
  ticket_id: number | null;
  type: NotificationType;
  title: string;
  message: string;
  dedupe_key: string;
  is_read: boolean;
  metadata_json: string | null;
  created_at: string;
}

export const categories: TicketCategory[] = ["Technical", "Billing", "Account", "General", "Other"];
export const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];
export const statuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];
export const reassignmentStatuses: ReassignmentRequestStatus[] = ["Pending", "Approved", "Rejected"];
