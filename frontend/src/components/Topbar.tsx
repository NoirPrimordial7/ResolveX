import { LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-xl transition-colors dark:border-neutral-800 dark:bg-neutral-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-orange-500 dark:bg-white dark:text-orange-600">
            <ShieldCheck size={19} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">ResolveX</p>
            <p className="hidden truncate text-xs text-neutral-500 dark:text-neutral-400 sm:block">
              Resolve customer issues faster.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <>
              <div className="hidden min-w-0 text-right md:block">
                <p className="truncate text-sm font-medium text-neutral-950 dark:text-white">{user.full_name}</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
              </div>
              <StatusBadge className="hidden capitalize sm:inline-flex" value={user.role} />
              <Button className="px-3" onClick={logout} size="sm" type="button" variant="secondary">
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
