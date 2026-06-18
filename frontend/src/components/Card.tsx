import type { HTMLAttributes } from "react";

import { cn } from "../utils/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-sm border border-white/10 bg-[#171717]/92 shadow-premium shadow-black/30 transition-colors dark:border-white/10 dark:bg-[#171717]/92",
        className
      )}
      {...props}
    />
  );
}
