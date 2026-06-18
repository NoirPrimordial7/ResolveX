import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "../utils/cn";

export const fieldClassName =
  "w-full rounded-md border border-white/10 bg-[#0B0D12]/70 px-3.5 py-2.5 text-sm text-[#F5F7FB] outline-none transition placeholder:text-[#6F7A91] focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:bg-[#171B23] disabled:text-[#6F7A91] dark:border-white/10 dark:bg-[#0B0D12]/70 dark:text-[#F5F7FB] dark:placeholder:text-[#6F7A91] dark:focus:border-accent-400 dark:disabled:bg-[#171B23]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClassName, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClassName, "pr-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClassName, className)} {...props} />;
}
