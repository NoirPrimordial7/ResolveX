import type { User } from "../types";
import { cn } from "../utils/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl"
};

function initials(name?: string | null) {
  if (!name) return "RX";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "RX";
}

interface AvatarProps {
  user?: Pick<User, "avatar_url" | "email" | "full_name" | "name"> | null;
  label?: string;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({ className, label, size = "md", user }: AvatarProps) {
  const displayName = label || user?.full_name || user?.name || user?.email || "ResolveX user";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(231,111,81,0.95),rgba(199,81,46,0.88))] font-semibold text-white shadow-lg shadow-accent-600/15",
        sizeClasses[size],
        className
      )}
      title={displayName}
    >
      {user?.avatar_url ? (
        <img alt="" className="h-full w-full object-cover" src={user.avatar_url} />
      ) : (
        <span aria-hidden="true">{initials(displayName)}</span>
      )}
      <span className="sr-only">{displayName}</span>
    </span>
  );
}
