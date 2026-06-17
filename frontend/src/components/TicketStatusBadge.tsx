import type { TicketPriority, TicketStatus } from "../types";

interface BadgeProps {
  value: TicketStatus | TicketPriority | string;
  type?: "status" | "priority";
}

function classFor(value: string, type: "status" | "priority") {
  if (type === "priority") {
    const map: Record<string, string> = {
      Low: "border-sky-500/30 bg-sky-500/10 text-sky-200",
      Medium: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
      High: "border-amber-500/30 bg-amber-500/10 text-amber-200",
      Urgent: "border-red-500/30 bg-red-500/10 text-red-200"
    };
    return map[value] || map.Medium;
  }

  const map: Record<string, string> = {
    Open: "border-accent-500/30 bg-accent-500/10 text-accent-100",
    "In Progress": "border-sky-500/30 bg-sky-500/10 text-sky-200",
    Resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    Closed: "border-neutral-500/30 bg-neutral-500/10 text-neutral-300"
  };
  return map[value] || map.Open;
}

export default function TicketStatusBadge({ value, type = "status" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classFor(value, type)}`}>
      {value}
    </span>
  );
}
