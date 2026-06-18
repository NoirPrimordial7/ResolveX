import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "../utils/cn";

export const fieldClassName =
  "w-full rounded-sm border border-white/10 bg-[#0B0B0A]/80 px-3.5 py-2.5 text-sm text-[#F5F1EA] outline-none transition placeholder:text-[#726D66] focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:bg-[#202020] disabled:text-[#726D66] dark:border-white/10 dark:bg-[#0B0B0A]/80 dark:text-[#F5F1EA] dark:placeholder:text-[#726D66] dark:focus:border-accent-500 dark:disabled:bg-[#202020]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClassName, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClassName, "pr-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClassName, className)} {...props} />;
}
