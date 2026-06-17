import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  indicator?: string;
  tone?: "orange" | "green" | "red" | "amber" | "blue";
}

const toneClasses = {
  orange: "bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
  green:
    "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  red: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  blue: "bg-sky-50 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20"
};

const barClasses = {
  orange: "bg-orange-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500"
};

export default function StatCard({ description, indicator, title, value, icon: Icon, tone = "orange" }: StatCardProps) {
  return (
    <div className="panel-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 ${toneClasses[tone]}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-neutral-500 dark:text-neutral-400">
          {description || "Current workspace"}
        </p>
        {indicator && <span className="shrink-0 text-xs font-semibold text-neutral-600 dark:text-neutral-300">{indicator}</span>}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div className={`h-full w-2/3 rounded-full ${barClasses[tone]}`} />
      </div>
    </div>
  );
}
