import type { TicketStatus } from "../types";
import { cn } from "../utils/cn";

const statusClasses: Record<string, string> = {
  Open: "border-accent-500/25 bg-accent-500/10 text-accent-200",
  "In Progress": "border-sky-500/25 bg-sky-500/10 text-sky-300",
  Resolved:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Closed:
    "border-white/10 bg-white/[0.06] text-[#DCE3F2]"
};

export default function StatusBadge({ className, value }: { className?: string; value: TicketStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusClasses[value] || statusClasses.Closed,
        className
      )}
    >
      {value}
    </span>
  );
}
