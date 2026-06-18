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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-accent-500/35 bg-accent-500/10 text-accent-300 shadow-glow">
        <PixelIcon name="inbox" size={34} />
      </div>
      <h3 className="display-type mt-5 text-3xl leading-none text-[#F5F1EA] dark:text-[#F5F1EA]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#A7A29A] dark:text-[#A7A29A]">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}
