import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  indicator?: string;
  tone?: "accent" | "green" | "red" | "amber" | "blue";
}

const toneClasses = {
  accent: "bg-accent-500/10 text-accent-300 ring-accent-500/25",
  green:
    "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  red: "bg-red-500/10 text-red-300 ring-red-500/25",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  blue: "bg-sky-500/10 text-sky-300 ring-sky-500/25"
};

const barClasses = {
  accent: "bg-accent-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500"
};

export default function StatCard({ description, indicator, title, value, icon: Icon, tone = "accent" }: StatCardProps) {
  return (
    <div className="panel-card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(231,111,81,0.13),transparent_34%)] opacity-80" />
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-0">
          <p className="truncate text-sm font-medium text-[#AAB3C5]">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#F5F7FB]">{value}</p>
        </div>
        <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 ${toneClasses[tone]}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-[#AAB3C5]">
          {description || "Current workspace"}
        </p>
        {indicator && <span className="shrink-0 text-xs font-semibold text-[#DCE3F2]">{indicator}</span>}
      </div>
      <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full w-2/3 rounded-full ${barClasses[tone]}`} />
      </div>
    </div>
  );
}
