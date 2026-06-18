import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import Card from "./Card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent-500/25 bg-accent-500/10 text-accent-300 shadow-glow">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#F5F7FB] dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#AAB3C5] dark:text-[#AAB3C5]">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}
