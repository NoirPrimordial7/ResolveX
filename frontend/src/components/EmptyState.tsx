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
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}
