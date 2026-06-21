import { Bell, CheckCheck, Circle, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useNotifications } from "../context/NotificationContext";
import { cn } from "../utils/cn";
import Button from "./Button";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export default function NotificationBell() {
  const { markAllRead, markRead, notificationPath, notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const visibleNotifications = notifications.slice(0, 8);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
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
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="Open notifications"
        className="app-icon-button relative"
        onClick={() => setOpen((current) => !current)}
        title="Notifications"
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-center text-[10px] font-black leading-none text-[#0B0B0A] shadow-[0_0_0_3px_rgba(250,246,239,0.92),0_10px_20px_rgba(255,75,36,0.24)] dark:shadow-glow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="app-dropdown absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(92vw,380px)] max-w-[calc(100vw-1rem)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-orange-200/40 bg-white/35 px-4 py-3 dark:border-white/10 dark:bg-transparent">
            <div>
              <p className="text-xs font-black uppercase app-text-primary">Notifications</p>
              <p className="mt-0.5 text-xs app-text-muted">{unreadCount} unread</p>
            </div>
            <Button className="h-8 px-2.5" disabled={!unreadCount} onClick={() => void markAllRead()} size="sm" type="button" variant="ghost">
              <CheckCheck size={15} />
              Mark all
            </Button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto text-accent-500" size={26} />
                <p className="mt-3 text-sm font-semibold app-text-primary">No notifications yet</p>
                <p className="mt-1 text-xs leading-5 app-text-muted">
                  Queue updates and new replies will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {visibleNotifications.map((notification) => {
                  const unread = !notification.is_read;
                  const ticketPath = notificationPath(notification);
                  const content = (
                    <>
                      <span className={cn("mt-1 flex h-5 w-5 shrink-0 items-center justify-center", unread ? "text-accent-500" : "text-stone-400 dark:text-[#A7A29A]")}>
                        {unread ? <Circle fill="currentColor" size={8} /> : <ExternalLink size={14} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-sm app-text-primary",
                            unread ? "font-black" : "font-semibold"
                          )}
                        >
                          {notification.title}
                        </span>
                        <span className="mt-1 line-clamp-2 text-xs leading-5 app-text-muted">
                          {notification.message}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold uppercase app-text-subtle">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                      </span>
                    </>
                  );

                  if (ticketPath) {
                    return (
                      <Link
                        className={cn(
                          "flex gap-3 rounded-xl border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.64)] transition hover:-translate-y-px hover:border-accent-500/35 hover:bg-white/75 hover:shadow-[0_12px_30px_rgba(120,72,30,0.09)] dark:rounded-sm dark:shadow-none dark:hover:translate-y-0 dark:hover:bg-accent-500/10 dark:hover:shadow-none",
                          unread
                            ? "border-accent-500/28 bg-[linear-gradient(135deg,rgba(255,247,237,0.94),rgba(255,237,213,0.58))] dark:bg-accent-500/10"
                            : "border-transparent bg-white/20 opacity-85 hover:opacity-100 dark:bg-transparent"
                        )}
                        key={notification.id}
                        onClick={() => {
                          void markRead(notification.id);
                          setOpen(false);
                        }}
                        to={ticketPath}
                      >
                        {content}
                        <span className="ml-auto hidden shrink-0 self-center rounded-full bg-accent-500/10 px-2 py-1 text-[10px] font-black uppercase text-orange-700 dark:rounded-sm dark:text-accent-200 sm:inline-flex">
                          Open Query
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      className={cn(
                        "flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.64)] transition hover:-translate-y-px hover:border-accent-500/35 hover:bg-white/75 hover:shadow-[0_12px_30px_rgba(120,72,30,0.09)] dark:rounded-sm dark:shadow-none dark:hover:translate-y-0 dark:hover:bg-accent-500/10 dark:hover:shadow-none",
                        unread
                          ? "border-accent-500/28 bg-[linear-gradient(135deg,rgba(255,247,237,0.94),rgba(255,237,213,0.58))] dark:bg-accent-500/10"
                          : "border-transparent bg-white/20 opacity-85 hover:opacity-100 dark:bg-transparent"
                      )}
                      key={notification.id}
                      onClick={() => void markRead(notification.id)}
                      type="button"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
