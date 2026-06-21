import type { TicketStatus } from "../types";
import { cn } from "../utils/cn";

const statusClasses: Record<string, string> = {
  Open: "border-accent-500/30 bg-accent-500/10 text-orange-700 dark:text-accent-200",
  "In Progress": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Resolved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Closed:
    "border-stone-300/60 bg-white/60 text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#F5F1EA]"
};

export default function StatusBadge({ className, value }: { className?: string; value: TicketStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:rounded-sm dark:shadow-none",
        statusClasses[value] || statusClasses.Closed,
        className
      )}
    >
      {value}
    </span>
  );
}
