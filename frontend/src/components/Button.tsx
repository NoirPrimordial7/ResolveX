import type { ButtonHTMLAttributes } from "react";

import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-black uppercase outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent-500/35";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "app-button-primary",
  secondary: "app-button-secondary",
  ghost: "app-button-ghost",
  danger: "app-button-danger"
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
