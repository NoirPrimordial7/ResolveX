import type { TicketPriority, TicketStatus } from "../types";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface BadgeProps {
  value: TicketStatus | TicketPriority | string;
  type?: "status" | "priority";
}

export default function TicketStatusBadge({ value, type = "status" }: BadgeProps) {
  return type === "priority" ? <PriorityBadge value={value} /> : <StatusBadge value={value} />;
}
