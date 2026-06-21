import PixelIcon from "./PixelIcon";
import type { PixelIconName } from "./PixelIcon";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: unknown;
  description?: string;
  indicator?: string;
  tone?: "accent" | "green" | "red" | "amber" | "blue";
}

const toneClasses = {
  accent:
    "border-orange-200/60 bg-[linear-gradient(135deg,rgba(255,75,36,0.13),rgba(249,115,22,0.08))] text-orange-700 ring-accent-500/20 dark:border-accent-500/25 dark:bg-accent-500/10 dark:text-accent-300",
  green:
    "border-emerald-200/70 bg-[linear-gradient(135deg,rgba(16,185,129,0.13),rgba(16,185,129,0.06))] text-emerald-700 ring-emerald-500/20 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
  red: "border-red-200/70 bg-[linear-gradient(135deg,rgba(239,68,68,0.13),rgba(239,68,68,0.06))] text-red-700 ring-red-500/20 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300",
  amber:
    "border-amber-200/80 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(245,158,11,0.06))] text-amber-700 ring-amber-500/20 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
  blue: "border-sky-200/80 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(56,189,248,0.06))] text-sky-700 ring-sky-500/20 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300"
};

const barClasses = {
  accent: "bg-accent-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500"
};

function iconForTitle(title: string, tone: StatCardProps["tone"]): PixelIconName {
  const normalized = title.toLowerCase();
  if (normalized.includes("agent")) return "headset";
  if (normalized.includes("assign")) return "users";
  if (normalized.includes("reassign")) return "repeat";
  if (normalized.includes("open")) return "clock";
  if (normalized.includes("progress") || normalized.includes("active")) return "flame";
  if (normalized.includes("resolved") || normalized.includes("done")) return "check";
  if (normalized.includes("unassigned")) return "alert";
  if (tone === "green") return "check";
  if (tone === "red") return "alert";
  if (tone === "amber") return "clock";
  if (tone === "blue") return "headset";
  return "ticket";
}

export default function StatCard({ description, indicator, title, value, tone = "accent" }: StatCardProps) {
  return (
    <div className="panel-card pixel-frame group relative overflow-hidden p-5 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-[0_24px_70px_rgba(120,72,30,0.14),0_10px_28px_rgba(249,115,22,0.10)] dark:hover:translate-y-0 dark:hover:border-accent-500/35 dark:hover:shadow-glow">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(255,255,255,0.76),transparent_13rem),linear-gradient(135deg,rgba(255,255,255,0.44),rgba(249,115,22,0.06)_44%,transparent_74%)] dark:bg-[linear-gradient(135deg,rgba(255,75,36,0.10),transparent_45%)]" />
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-0">
          <p className="truncate text-xs font-black uppercase app-text-muted">{title}</p>
          <p className="mt-2 text-4xl font-black leading-none tracking-normal app-text-primary sm:text-5xl">{value}</p>
        </div>
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(120,72,30,0.08)] ring-1 dark:rounded-sm dark:shadow-none ${toneClasses[tone]}`}>
          <PixelIcon name={iconForTitle(title, tone)} size={30} />
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs app-text-muted">
          {description || "Current workspace"}
        </p>
        {indicator && (
          <span className="shrink-0 rounded-full border border-orange-200/45 bg-white/55 px-2 py-1 text-[10px] font-black uppercase text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-[#F5F1EA] dark:shadow-none">
            {indicator}
          </span>
        )}
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-orange-100/90 dark:rounded-sm dark:bg-white/10">
        <div className={`h-full w-2/3 rounded-full shadow-[0_0_18px_rgba(249,115,22,0.18)] dark:rounded-sm dark:shadow-none ${barClasses[tone]}`} />
      </div>
    </div>
  );
}
