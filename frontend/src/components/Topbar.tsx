import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import Button from "./Button";
import ProfileModal from "./ProfileModal";
import StatusBadge from "./StatusBadge";
import ThemeToggle from "./ThemeToggle";

function formatRole(role: string) {
  return role.replace("_", " ");
}

export default function Topbar() {
  const { logout, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0D12]/82 backdrop-blur-xl transition-colors">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-white shadow-glow">
            <ShieldCheck size={19} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#F5F7FB]">ResolveX</p>
            <p className="hidden truncate text-xs text-[#AAB3C5] sm:block">
              Resolve customer issues faster.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <>
              <button
                className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-left transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
                onClick={() => setProfileOpen(true)}
                type="button"
              >
                <Avatar size="sm" user={user} />
                <span className="hidden min-w-0 max-w-56 md:block xl:max-w-72">
                  <span className="block truncate text-sm font-medium text-[#F5F7FB]">{user.full_name}</span>
                  <span className="block truncate text-xs text-[#AAB3C5]">{user.email}</span>
                </span>
              </button>
              <StatusBadge className="hidden capitalize sm:inline-flex" value={formatRole(user.role)} />
              <Button className="px-3" onClick={logout} size="sm" type="button" variant="secondary">
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <ProfileModal onClose={() => setProfileOpen(false)} open={profileOpen} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
