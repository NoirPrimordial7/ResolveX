import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import Button from "./Button";
import PixelIcon from "./PixelIcon";
import ProfileModal from "./ProfileModal";
import StatusBadge from "./StatusBadge";
import ThemeToggle from "./ThemeToggle";

function formatRole(role: string) {
  return role.replace("_", " ");
}

function routeLabel(pathname: string) {
  if (pathname.includes("/admin/reassignment")) return "Reassignments";
  if (pathname.includes("/admin/agents")) return "Agent Workload";
  if (pathname.includes("/admin/tickets")) return "Admin Queue";
  if (pathname.includes("/admin/dashboard")) return "Control Center";
  if (pathname.includes("/agent/tickets")) return "Assigned Queue";
  if (pathname.includes("/agent/dashboard")) return "Agent Desk";
  if (pathname.includes("/tickets/new")) return "New Ticket";
  if (pathname.includes("/tickets/")) return "Ticket Thread";
  if (pathname.includes("/customer/dashboard")) return "Customer Hub";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0B0A]/88 backdrop-blur-xl transition-colors">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-[#F5F1EA] transition hover:border-accent-500/45 hover:bg-accent-500/10 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <PixelIcon name="menu" size={23} />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent-500 text-[#0B0B0A] shadow-glow">
            <PixelIcon name="shield" size={26} />
          </div>
          <div className="min-w-0">
            <p className="display-type truncate text-2xl leading-none text-[#F5F1EA]">ResolveX</p>
            <p className="hidden truncate text-[11px] font-black uppercase text-[#A7A29A] sm:block">Support operations</p>
          </div>
        </div>

        <div className="hidden min-w-0 items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black uppercase text-[#A7A29A] md:flex">
          <span className="h-1.5 w-1.5 bg-accent-500" />
          <span className="truncate">{routeLabel(location.pathname)}</span>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <>
              <StatusBadge className="hidden capitalize sm:inline-flex" value={formatRole(user.role)} />
              <div className="relative" ref={menuRef}>
                <button
                  aria-expanded={menuOpen}
                  className="flex min-w-0 items-center gap-2 rounded-sm border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left transition hover:border-accent-500/45 hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
                  onClick={() => setMenuOpen((current) => !current)}
                  type="button"
                >
                  <Avatar size="sm" user={user} />
                  <span className="hidden min-w-0 max-w-44 md:block xl:max-w-56">
                    <span className="block truncate text-xs font-black uppercase text-[#F5F1EA]">{user.full_name}</span>
                    <span className="block truncate text-[11px] text-[#A7A29A]">{user.email}</span>
                  </span>
                  <PixelIcon className="text-[#A7A29A]" name="arrow" size={18} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 border border-white/10 bg-[#171717] p-2 shadow-premium shadow-black/45">
                    <div className="border-b border-white/10 p-3">
                      <p className="truncate text-xs font-black uppercase text-[#F5F1EA]">{user.full_name}</p>
                      <p className="mt-1 truncate text-xs text-[#A7A29A]">{user.email}</p>
                    </div>
                    <button
                      className="mt-2 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-xs font-black uppercase text-[#F5F1EA] transition hover:bg-accent-500/10 hover:text-accent-200"
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
                      className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-xs font-black uppercase text-red-200 transition hover:bg-red-500/10"
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
