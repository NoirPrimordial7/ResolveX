import type { ReactNode } from "react";

import Card from "./Card";
import PixelIcon from "./PixelIcon";

interface EmptyStateProps {
  icon?: unknown;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-accent-500/30 bg-accent-500/10 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_rgba(255,75,36,0.12)] dark:rounded-sm dark:text-accent-300 dark:shadow-glow">
        <PixelIcon name="inbox" size={34} />
      </div>
      <h3 className="display-type mt-5 text-3xl leading-none app-text-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 app-text-muted">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}
