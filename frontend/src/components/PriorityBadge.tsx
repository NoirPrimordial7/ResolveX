import type { TicketPriority } from "../types";
import { cn } from "../utils/cn";

const priorityClasses: Record<string, string> = {
  Low: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300",
  Medium:
    "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  High: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
  Urgent: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
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
