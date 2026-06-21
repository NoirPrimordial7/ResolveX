import type { TicketPriority } from "../types";
import { cn } from "../utils/cn";

const priorityClasses: Record<string, string> = {
  Low: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Medium:
    "border-stone-300/60 bg-white/60 text-stone-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#F5F1EA]",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Urgent: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
};

export default function PriorityBadge({ className, value }: { className?: string; value: TicketPriority | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:rounded-sm dark:shadow-none",
        priorityClasses[value] || priorityClasses.Medium,
        className
      )}
    >
      {value}
    </span>
  );
}
