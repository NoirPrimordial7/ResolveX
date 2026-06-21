import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import Button from "./Button";
import NotificationBell from "./NotificationBell";
import PixelIcon from "./PixelIcon";
import ProfileModal from "./ProfileModal";
import StatusBadge from "./StatusBadge";
import ThemeToggle from "./ThemeToggle";
import { roleLabel } from "../utils/roles";

function routeLabel(pathname: string) {
  if (pathname.includes("/admin/reassignment")) return "Faculty Handover Requests";
  if (pathname.includes("/admin/agents")) return "Faculty Workload";
  if (pathname.includes("/admin/tickets")) return "Placement Head Queue";
  if (pathname.includes("/admin/dashboard")) return "Placement Control";
  if (pathname.includes("/agent/tickets")) return "Assigned Student Queries";
  if (pathname.includes("/agent/dashboard")) return "Faculty Desk";
  if (pathname.includes("/tickets/new")) return "Raise Placement Query";
  if (pathname.includes("/tickets/")) return "Placement Query Thread";
  if (pathname.includes("/customer/dashboard")) return "Student Helpdesk";
  return "Workspace";
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="app-topbar">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation"
            className="app-icon-button lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <PixelIcon name="menu" size={23} />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-[#0B0B0A] shadow-[0_14px_30px_rgba(255,75,36,0.22)] dark:rounded-sm dark:shadow-glow">
            <PixelIcon name="shield" size={26} />
          </div>
          <div className="min-w-0">
            <p className="display-type truncate text-2xl leading-none app-text-primary">ResolveX</p>
            <p className="hidden truncate text-[11px] font-black uppercase app-text-muted sm:block">Placement Support Desk</p>
          </div>
        </div>

        <div className="hidden min-w-0 items-center gap-2 rounded-full border border-orange-200/45 bg-white/60 px-3 py-2 text-xs font-black uppercase text-[#6B625A] shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-[#A7A29A] dark:shadow-none md:flex">
          <span className="h-1.5 w-1.5 bg-accent-500" />
          <span className="truncate">{routeLabel(location.pathname)}</span>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationBell />
          {user && (
            <>
              <StatusBadge className="hidden sm:inline-flex" value={roleLabel(user.role)} />
              <div className="relative" ref={menuRef}>
                <button
                  aria-expanded={menuOpen}
                  className="flex min-w-0 items-center gap-2 rounded-xl border border-orange-200/45 bg-white/60 px-2 py-1.5 text-left shadow-[0_10px_24px_rgba(120,72,30,0.08)] transition hover:-translate-y-px hover:border-accent-500/45 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:translate-y-0"
                  onClick={() => setMenuOpen((current) => !current)}
                  type="button"
                >
                  <Avatar size="sm" user={user} />
                  <span className="hidden min-w-0 max-w-44 md:block xl:max-w-56">
                    <span className="block truncate text-xs font-black uppercase app-text-primary">{user.full_name}</span>
                    <span className="block truncate text-[11px] app-text-muted">{user.email}</span>
                  </span>
                  <PixelIcon className="app-text-muted" name="arrow" size={18} />
                </button>

                {menuOpen && (
                  <div className="app-dropdown absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 p-2">
                    <div className="border-b border-orange-200/45 p-3 dark:border-white/10">
                      <p className="truncate text-xs font-black uppercase app-text-primary">{user.full_name}</p>
                      <p className="mt-1 truncate text-xs app-text-muted">{user.email}</p>
                    </div>
                    <button
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase app-text-primary transition hover:bg-white/65 hover:text-orange-700 dark:rounded-sm dark:hover:bg-accent-500/10 dark:hover:text-accent-200"
                      onClick={() => {
                        setMenuOpen(false);
                        setProfileOpen(true);
                      }}
                      type="button"
                    >
                      <PixelIcon name="settings" size={21} />
                      Profile settings
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase text-red-700 transition hover:bg-red-500/10 dark:rounded-sm dark:text-red-200"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      type="button"
                    >
                      <PixelIcon name="logout" size={21} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <ProfileModal onClose={() => setProfileOpen(false)} open={profileOpen} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
