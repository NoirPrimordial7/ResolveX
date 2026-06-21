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
        "app-icon-button",
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
