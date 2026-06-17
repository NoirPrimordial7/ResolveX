import type { TicketStatus } from "../types";
import { cn } from "../utils/cn";

const statusClasses: Record<string, string> = {
  Open: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300",
  Resolved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
  Closed:
    "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
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
