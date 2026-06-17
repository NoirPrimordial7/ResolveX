import type { ButtonHTMLAttributes } from "react";

import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-orange-500/35";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-600 text-white shadow-sm shadow-orange-600/20 hover:bg-orange-500 dark:bg-orange-500 dark:text-neutral-950 dark:hover:bg-orange-400",
  secondary:
    "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
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
