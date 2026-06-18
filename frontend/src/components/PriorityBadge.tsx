import type { TicketPriority } from "../types";
import { cn } from "../utils/cn";

const priorityClasses: Record<string, string> = {
  Low: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  Medium:
    "border-white/10 bg-white/[0.06] text-[#DCE3F2]",
  High: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Urgent: "border-red-500/25 bg-red-500/10 text-red-300"
};

export default function PriorityBadge({ className, value }: { className?: string; value: TicketPriority | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        priorityClasses[value] || priorityClasses.Medium,
        className
      )}
    >
      {value}
    </span>
  );
}
