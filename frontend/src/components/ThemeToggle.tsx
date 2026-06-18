import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";
import PixelIcon from "./PixelIcon";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-[#F5F1EA] outline-none transition hover:border-accent-500/45 hover:bg-accent-500/10 focus-visible:ring-2 focus-visible:ring-accent-500/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F5F1EA] dark:hover:border-accent-500/45 dark:hover:bg-accent-500/10",
        className
      )}
      onClick={toggleTheme}
      title={isDark ? "Light mode" : "Dark mode"}
      type="button"
    >
      <PixelIcon name={isDark ? "sun" : "moon"} size={22} />
    </button>
  );
}
