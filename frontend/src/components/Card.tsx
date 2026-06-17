import type { HTMLAttributes } from "react";

import { cn } from "../utils/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-white shadow-sm shadow-neutral-200/50 transition-colors dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-none",
        className
      )}
      {...props}
    />
  );
}
