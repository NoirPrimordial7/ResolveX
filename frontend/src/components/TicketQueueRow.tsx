import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import type { Ticket } from "../types";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import PixelIcon from "./PixelIcon";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

type TicketQueueRole = "customer" | "agent" | "admin";

interface TicketQueueRowProps {
  actions?: ReactNode;
  className?: string;
  onOpen?: () => void;
  role?: TicketQueueRole;
  ticket: Ticket;
  to?: string;
  unread?: boolean;
}

function formatUpdated(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  }).format(date);
}

function previewFor(ticket: Ticket) {
  const comments = [...(ticket.comments || [])].sort(
    (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
  );
  const latestComment = comments.length ? comments[comments.length - 1] : null;
  return latestComment?.message || ticket.description || "No description provided.";
}

function personFor(ticket: Ticket, role: TicketQueueRole) {
  if (role === "customer") {
    return {
      label: "Faculty",
      user: ticket.assigned_to,
      fallback: "Unassigned faculty"
    };
  }

  return {
    label: "Student",
    user: ticket.created_by,
    fallback: "Unknown student"
  };
}

export default function TicketQueueRow({ actions, className, onOpen, role = "customer", ticket, to, unread = false }: TicketQueueRowProps) {
  const person = personFor(ticket, role);
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-[5px] flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          {unread && <span className="h-2.5 w-2.5 rounded-full bg-accent-500 shadow-[0_0_0_4px_rgba(255,75,36,0.12),0_8px_16px_rgba(255,75,36,0.22)] dark:shadow-glow" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className={cn(
                "min-w-0 max-w-full line-clamp-1 text-sm uppercase leading-5 tracking-normal text-stone-950 transition-colors group-hover:text-orange-700 dark:text-[#F5F1EA] dark:group-hover:text-accent-300",
                unread ? "font-black" : "font-semibold"
              )}
            >
              {ticket.title}
            </h3>
            {unread && (
              <span className="inline-flex w-fit shrink-0 rounded-full border border-accent-500/20 bg-accent-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] dark:rounded-sm dark:text-accent-200 dark:shadow-none">
                New reply
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-sm leading-5 text-stone-600 dark:text-[#A7A29A]">{previewFor(ticket)}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="app-chip">{ticket.category}</span>
            <PriorityBadge value={ticket.priority} />
            <StatusBadge value={ticket.status} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 text-left md:w-[220px] md:justify-self-end">
        <div className="flex min-w-0 items-center gap-2">
          {person.user ? (
            <Avatar size="sm" user={person.user} />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-200/45 bg-white/70 text-stone-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:rounded-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-[#A7A29A] dark:shadow-none">
              <PixelIcon name="user" size={18} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase text-stone-400 dark:text-[#A7A29A]">{person.label}</span>
            <span className="block truncate text-xs font-semibold text-stone-700 dark:text-[#F5F1EA]">
              {person.user?.full_name || person.fallback}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs leading-5 text-stone-500 dark:text-[#A7A29A]">
          <PixelIcon name="clock" size={16} />
          Updated {formatUpdated(ticket.updated_at || ticket.created_at)}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "group mx-2 my-2 flex flex-col gap-3 rounded-xl border px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition-all hover:relative hover:z-[1] hover:-translate-y-0.5 hover:border-accent-500/30 hover:bg-white/78 hover:shadow-[0_14px_36px_rgba(120,72,30,0.10)] dark:mx-0 dark:my-0 dark:rounded-sm dark:border-[#3A332F] dark:shadow-none dark:hover:translate-y-0 dark:hover:bg-white/[0.04] dark:hover:shadow-none sm:px-5 lg:flex-row lg:items-center",
        unread
          ? "border-accent-500/28 bg-[linear-gradient(135deg,rgba(255,247,237,0.92),rgba(255,237,213,0.62))] dark:bg-accent-500/10"
          : "border-orange-200/40 bg-white/45 dark:bg-transparent",
        className
      )}
    >
      {to ? (
        <Link
          className="grid min-w-0 flex-1 gap-3 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 md:grid-cols-[minmax(0,1fr)_minmax(190px,220px)] md:items-center md:gap-4"
          onClick={onOpen}
          to={to}
        >
          {content}
        </Link>
      ) : (
        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(190px,220px)] md:items-center md:gap-4">{content}</div>
      )}

      {actions && (
        <div className="shrink-0 border-t border-orange-200/45 pt-2 dark:border-[#3A332F] lg:w-[340px] lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
