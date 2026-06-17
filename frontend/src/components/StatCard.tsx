import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "orange" | "green" | "red" | "amber" | "blue";
}

const toneClasses = {
  orange: "bg-accent-500/15 text-accent-400 ring-accent-500/25",
  green: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  red: "bg-red-500/15 text-red-300 ring-red-500/25",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  blue: "bg-sky-500/15 text-sky-300 ring-sky-500/25"
};

export default function StatCard({ title, value, icon: Icon, tone = "orange" }: StatCardProps) {
  return (
    <div className="panel-card rounded-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-sm ring-1 ${toneClasses[tone]}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
