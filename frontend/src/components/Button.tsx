import type { ButtonHTMLAttributes } from "react";

import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent-500/35";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-500 text-white shadow-lg shadow-accent-600/20 hover:bg-accent-400 dark:bg-accent-500 dark:text-white dark:hover:bg-accent-400",
  secondary:
    "border border-white/10 bg-white/[0.04] text-[#DCE3F2] hover:border-white/20 hover:bg-white/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DCE3F2] dark:hover:border-white/20 dark:hover:bg-white/[0.07]",
  ghost:
    "text-[#AAB3C5] hover:bg-white/[0.06] hover:text-white dark:text-[#AAB3C5] dark:hover:bg-white/[0.06] dark:hover:text-white",
  danger:
    "border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm"
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function buttonClassName({
  className,
  size = "md",
  variant = "secondary"
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export default function Button({ className, size = "md", variant = "secondary", ...props }: ButtonProps) {
  return <button className={buttonClassName({ className, size, variant })} {...props} />;
}
