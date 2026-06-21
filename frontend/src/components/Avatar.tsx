import type { User } from "../types";
import { cn } from "../utils/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl"
};

const roleColorClasses = {
  admin: "border-accent-500/35 bg-[linear-gradient(135deg,#FF4B24,#D93618)] text-[#0B0B0A]",
  customer: "border-sky-500/35 bg-[linear-gradient(135deg,#38BDF8,#0EA5E9)] text-[#0B0B0A]",
  support_agent: "border-emerald-500/35 bg-[linear-gradient(135deg,#34D399,#10B981)] text-[#0B0B0A]",
  fallback: "border-accent-500/35 bg-[linear-gradient(135deg,#FF4B24,#D93618)] text-[#0B0B0A]"
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
  user?: (Pick<User, "avatar_url" | "email" | "full_name" | "name"> & { role?: User["role"] }) | null;
  label?: string;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({ className, label, size = "md", user }: AvatarProps) {
  const displayName = label || user?.full_name || user?.name || user?.email || "ResolveX user";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border font-black uppercase shadow-[0_10px_24px_rgba(255,75,36,0.18)] dark:rounded-sm dark:shadow-glow",
        roleColorClasses[user?.role || "fallback"],
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
