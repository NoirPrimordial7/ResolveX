import type { HTMLAttributes } from "react";

import { cn } from "../utils/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-white/10 bg-[#171B23]/90 shadow-premium shadow-black/20 transition-colors dark:border-white/10 dark:bg-[#171B23]/90",
        className
      )}
      {...props}
    />
  );
}
