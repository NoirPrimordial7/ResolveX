import type { ButtonHTMLAttributes } from "react";

import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-sm font-black uppercase outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent-500/35";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-500 text-[#0B0B0A] shadow-glow hover:bg-accent-400 dark:bg-accent-500 dark:text-[#0B0B0A] dark:hover:bg-accent-400",
  secondary:
    "border border-white/10 bg-white/[0.04] text-[#F5F1EA] hover:border-accent-500/45 hover:bg-accent-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F5F1EA] dark:hover:border-accent-500/45 dark:hover:bg-accent-500/10",
  ghost:
    "text-[#A7A29A] hover:bg-white/[0.06] hover:text-[#F5F1EA] dark:text-[#A7A29A] dark:hover:bg-white/[0.06] dark:hover:text-[#F5F1EA]",
  danger:
    "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[11px]",
  md: "h-10 px-4 text-xs"
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
