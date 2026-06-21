import type { ReactNode } from "react";

import Card from "./Card";
import PixelIcon from "./PixelIcon";
import type { PixelIconName } from "./PixelIcon";
import { cn } from "../utils/cn";

interface DashboardChartCardProps {
  badge?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: PixelIconName;
  title: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: number | string;
  payload?: Array<{
    color?: string;
    dataKey?: number | string;
    name?: number | string;
    value?: number | string;
  }>;
}

function formatTooltipValue(value: number | string | undefined) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en").format(value);
  }
  return value ?? "0";
}

export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const heading = label || payload[0]?.name || "Metric";

  return (
    <div className="min-w-36 rounded-xl border border-orange-200/70 bg-[#FFFDF8]/95 p-3 text-stone-950 shadow-[0_18px_50px_rgba(120,72,30,0.18),0_8px_22px_rgba(249,115,22,0.08)] backdrop-blur-xl dark:rounded-sm dark:border-white/10 dark:bg-[#171717] dark:text-[#F5F1EA] dark:shadow-black/45 dark:backdrop-blur-none">
      <p className="mb-2 text-[11px] font-black uppercase text-[#62584F] dark:text-[#A7A29A]">{heading}</p>
      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div className="flex items-center justify-between gap-5 text-xs" key={`${item.dataKey || item.name || "metric"}-${index}`}>
            <span className="flex min-w-0 items-center gap-2 font-semibold text-[#62584F] dark:text-[#C4BFB7]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color || "#FF4A2E" }} />
              <span className="truncate">{item.name || item.dataKey}</span>
            </span>
            <span className="font-black text-stone-950 dark:text-[#F5F1EA]">{formatTooltipValue(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardChartCard({ badge = "Live", children, className, description, icon = "dashboard", title }: DashboardChartCardProps) {
  return (
    <Card className={cn("relative min-h-[360px] overflow-hidden p-5 sm:p-6", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_0%,rgba(255,255,255,0.82),transparent_14rem),linear-gradient(180deg,rgba(255,255,255,0.46),transparent_42%)] dark:bg-[linear-gradient(135deg,rgba(255,75,36,0.08),transparent_42%)]" />
      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs font-black uppercase app-text-primary">{title}</h2>
            <span className="rounded-full border border-orange-200/45 bg-white/55 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-accent-200 dark:shadow-none">
              {badge}
            </span>
          </div>
          {description && <p className="mt-1.5 text-sm leading-6 app-text-muted">{description}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-200/45 bg-white/60 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(120,72,30,0.08)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-accent-300 dark:shadow-none">
          <PixelIcon name={icon} size={21} />
        </span>
      </div>
      <div className="relative h-64 rounded-2xl border border-orange-200/25 bg-white/28 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] dark:rounded-sm dark:border-white/5 dark:bg-black/10 dark:shadow-none">
        {children}
      </div>
    </Card>
  );
}

export function ChartEmptyState({ message = "No chart data yet." }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-orange-200/60 bg-white/50 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur dark:rounded-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-none">
      <div className="px-4">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-500/25 bg-accent-500/10 text-accent-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:rounded-sm dark:shadow-none">
          <PixelIcon name="dashboard" size={28} />
        </span>
        <p className="mt-3 text-xs font-black uppercase app-text-primary">No data</p>
        <p className="mt-1 text-xs app-text-muted">{message}</p>
      </div>
    </div>
  );
}
