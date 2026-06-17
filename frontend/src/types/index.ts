export type UserRole = "customer" | "admin";
export type TicketCategory = "Technical" | "Billing" | "Account" | "General" | "Other";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  message: string;
  created_at: string;
  author: User;
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
  high_priority_tickets: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  recent_tickets: Ticket[];
}

export const categories: TicketCategory[] = ["Technical", "Billing", "Account", "General", "Other"];
export const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];
export const statuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];
