import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { notificationApi } from "../api/notificationApi";
import type { ResolveXNotification, Ticket, UserRole } from "../types";
import { useAuth } from "./AuthContext";
import PixelIcon from "../components/PixelIcon";

interface ObserveTicketsOptions {
  label?: string;
  ticketPath?: (ticket: Ticket) => string;
}

interface NotificationContextValue {
  notifications: ResolveXNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markTicketRead: (ticketId: number) => Promise<void>;
  notificationPath: (notification: ResolveXNotification) => string | undefined;
  observeTickets: (scope: string, tickets: Ticket[], options?: ObserveTicketsOptions) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function pathForNotification(notification: ResolveXNotification, role?: UserRole) {
  if (!notification.ticket_id) return undefined;
  if (role === "support_agent") return `/agent/tickets/${notification.ticket_id}`;
  return `/tickets/${notification.ticket_id}`;
}

function parseMetadata(notification: ResolveXNotification) {
  if (!notification.metadata_json) return {};
  try {
    return JSON.parse(notification.metadata_json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function isViewingTicket(notification: ResolveXNotification, role?: UserRole) {
  const path = pathForNotification(notification, role);
  if (!path || typeof window === "undefined") return false;
  const currentPath = window.location.pathname;
  return currentPath === path || currentPath === `/tickets/${notification.ticket_id}`;
}

function notificationTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function NotificationToasts({
  dismiss,
  notificationPath,
  toasts
}: {
  dismiss: (id: number) => void;
  notificationPath: (notification: ResolveXNotification) => string | undefined;
  toasts: ResolveXNotification[];
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 z-[70] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2 sm:bottom-auto sm:top-20">
      {toasts.map((notification) => {
        const path = notificationPath(notification);
        const metadata = parseMetadata(notification);
        const actionText = typeof metadata.action_text === "string" ? metadata.action_text : "Open Query";
        return (
          <div
            className="animate-[toast-slide_180ms_ease-out] overflow-hidden rounded-2xl border border-orange-200/45 bg-[#FFFDF8]/95 shadow-[0_24px_70px_rgba(120,72,30,0.18),0_8px_24px_rgba(249,115,22,0.08)] backdrop-blur-xl dark:rounded-sm dark:border-[#3A332F] dark:bg-[#171717]/95 dark:shadow-black/45 dark:backdrop-blur-none"
            key={notification.id}
          >
            <div className="flex gap-3 border-l-4 border-accent-500 p-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_0_4px_rgba(255,75,36,0.12),0_8px_16px_rgba(255,75,36,0.22)] dark:shadow-glow" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-black uppercase text-stone-950 dark:text-[#F5F1EA]">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600 dark:text-[#C4BFB7]">{notification.message}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase text-stone-500 dark:text-[#A7A29A]">
                    {notificationTime(notification.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    {path && (
                      <a
                        className="rounded-xl bg-accent-500 px-2.5 py-1.5 text-[11px] font-black uppercase text-[#0B0B0A] shadow-[0_10px_22px_rgba(255,75,36,0.20)] transition hover:bg-accent-400 dark:rounded-sm dark:shadow-glow"
                        href={path}
                        onClick={() => dismiss(notification.id)}
                      >
                        {actionText}
                      </a>
                    )}
                    <button
                      aria-label="Dismiss notification"
                      className="rounded-xl p-1 app-text-muted transition hover:bg-accent-500/10 hover:text-stone-950 dark:rounded-sm dark:hover:text-[#F5F1EA]"
                      onClick={() => dismiss(notification.id)}
                      type="button"
                    >
                      <PixelIcon name="close" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ResolveXNotification[]>([]);
  const [toasts, setToasts] = useState<ResolveXNotification[]>([]);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef<Set<number>>(new Set());
  const shownDedupeKeysRef = useRef<Set<string>>(new Set());
  const toastTimeoutsRef = useRef<Record<number, number>>({});

  const notificationPath = useCallback(
    (notification: ResolveXNotification) => pathForNotification(notification, user?.role),
    [user?.role]
  );

  const dismissToast = useCallback((id: number) => {
    window.clearTimeout(toastTimeoutsRef.current[id]);
    delete toastTimeoutsRef.current[id];
    setToasts((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const enqueueToast = useCallback(
    (notification: ResolveXNotification) => {
      if (notification.is_read || shownDedupeKeysRef.current.has(notification.dedupe_key) || isViewingTicket(notification, user?.role)) {
        return;
      }
      shownDedupeKeysRef.current.add(notification.dedupe_key);
      setToasts((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 4));
      toastTimeoutsRef.current[notification.id] = window.setTimeout(() => dismissToast(notification.id), 5_000);
    },
    [dismissToast, user?.role]
  );

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      knownIdsRef.current = new Set();
      initializedRef.current = false;
      return;
    }

    try {
      let data = await notificationApi.list();
      const autoReadIds = data
        .filter((notification) => !notification.is_read && isViewingTicket(notification, user.role))
        .map((notification) => notification.id);
      if (autoReadIds.length) {
        data = data.map((notification) => (autoReadIds.includes(notification.id) ? { ...notification, is_read: true } : notification));
        void Promise.all(autoReadIds.map((id) => notificationApi.markRead(id).catch(() => undefined)));
      }
      const nextIds = new Set(data.map((notification) => notification.id));
      if (initializedRef.current) {
        data
          .filter((notification) => !knownIdsRef.current.has(notification.id))
          .forEach((notification) => enqueueToast(notification));
      }
      knownIdsRef.current = nextIds;
      initializedRef.current = true;
      setNotifications(data);
    } catch {
      // Notification polling should never interrupt the active workflow.
    }
  }, [enqueueToast, user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!user) return undefined;
    const interval = window.setInterval(() => {
      refreshNotifications();
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [refreshNotifications, user]);

  useEffect(() => {
    return () => {
      Object.values(toastTimeoutsRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const markRead = useCallback(async (id: number) => {
    setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)));
    dismissToast(id);
    try {
      const updated = await notificationApi.markRead(id);
      setNotifications((current) => current.map((notification) => (notification.id === id ? updated : notification)));
    } catch {
      await refreshNotifications();
    }
  }, [dismissToast, refreshNotifications]);

  const markTicketRead = useCallback(
    async (ticketId: number) => {
      const matching = notifications.filter((notification) => notification.ticket_id === ticketId && !notification.is_read);
      if (matching.length === 0) return;
      setNotifications((current) =>
        current.map((notification) => (notification.ticket_id === ticketId ? { ...notification, is_read: true } : notification))
      );
      setToasts((current) => current.filter((notification) => notification.ticket_id !== ticketId));
      await Promise.all(matching.map((notification) => notificationApi.markRead(notification.id).catch(() => undefined)));
      await refreshNotifications();
    },
    [notifications, refreshNotifications]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    setToasts([]);
    try {
      await notificationApi.markAllRead();
      await refreshNotifications();
    } catch {
      await refreshNotifications();
    }
  }, [refreshNotifications]);

  const observeTickets = useCallback(() => undefined, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.is_read).length,
      markAllRead,
      markRead,
      markTicketRead,
      notificationPath,
      observeTickets,
      refreshNotifications
    }),
    [markAllRead, markRead, markTicketRead, notificationPath, notifications, observeTickets, refreshNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToasts dismiss={dismissToast} notificationPath={notificationPath} toasts={toasts} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return context;
}
