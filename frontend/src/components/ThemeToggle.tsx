import { Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#DCE3F2] outline-none transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-accent-500/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DCE3F2] dark:hover:border-white/20 dark:hover:bg-white/[0.07]",
        className
      )}
      onClick={toggleTheme}
      title={isDark ? "Light mode" : "Dark mode"}
      type="button"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
