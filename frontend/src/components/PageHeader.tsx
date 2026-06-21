import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ action, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-orange-200/45 pb-5 dark:border-white/10">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-px w-1/3 bg-gradient-to-r from-transparent via-accent-500/45 to-transparent dark:bg-accent-500/60 sm:block" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display-type mt-3 text-4xl leading-none app-text-primary sm:text-5xl xl:text-6xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 app-text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
