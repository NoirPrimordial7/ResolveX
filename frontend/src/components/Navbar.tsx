import { LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-[#080808]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orange-500 text-black">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold text-white">ResolveX</p>
            <p className="text-xs text-neutral-400">Resolve customer issues faster.</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{user.full_name}</p>
              <p className="text-xs capitalize text-neutral-400">{user.role}</p>
            </div>
            <button className="secondary-button px-3" onClick={logout} type="button" title="Logout">
              <LogOut size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
