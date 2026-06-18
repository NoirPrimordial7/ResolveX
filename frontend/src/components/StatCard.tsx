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
  accent: "bg-accent-500/10 text-accent-300 ring-accent-500/30",
  green:
    "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  red: "bg-red-500/10 text-red-300 ring-red-500/30",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  blue: "bg-sky-500/10 text-sky-300 ring-sky-500/30"
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
    <div className="panel-card pixel-frame relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,75,36,0.08),transparent_45%)] opacity-80" />
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-0">
          <p className="truncate text-xs font-black uppercase text-[#A7A29A]">{title}</p>
          <p className="display-type mt-2 text-5xl leading-none text-[#F5F1EA]">{value}</p>
        </div>
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-sm ring-1 ${toneClasses[tone]}`}>
          <PixelIcon name={iconForTitle(title, tone)} size={30} />
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-[#A7A29A]">
          {description || "Current workspace"}
        </p>
        {indicator && <span className="shrink-0 text-[11px] font-black uppercase text-[#F5F1EA]">{indicator}</span>}
      </div>
      <div className="relative mt-3 h-1 overflow-hidden bg-white/10">
        <div className={`h-full w-2/3 ${barClasses[tone]}`} />
      </div>
    </div>
  );
}
