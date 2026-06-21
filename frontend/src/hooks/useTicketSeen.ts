import { useCallback, useEffect, useState } from "react";

import type { Ticket } from "../types";

const STORAGE_KEY = "resolvex_ticket_seen";

type SeenMap = Record<string, string>;

function readSeenMap(): SeenMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as SeenMap) : {};
  } catch {
    return {};
  }
}

function latestTicketTimestamp(ticket: Ticket) {
  const commentTimestamps = (ticket.comments || []).map((comment) => new Date(comment.created_at).getTime());
  const latestCommentTime = commentTimestamps.length ? Math.max(...commentTimestamps) : 0;
  const updatedTime = new Date(ticket.updated_at || ticket.created_at).getTime();
  return new Date(Math.max(updatedTime, latestCommentTime)).toISOString();
}

export function getTicketSeenTimestamp(ticketId: number) {
  return readSeenMap()[String(ticketId)] || "";
}

export function setTicketSeenTimestamp(ticketId: number, timestamp: string) {
  const next = { ...readSeenMap(), [String(ticketId)]: timestamp };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function markTicketSeen(ticket: Ticket) {
  setTicketSeenTimestamp(ticket.id, latestTicketTimestamp(ticket));
}

export function useTicketSeen() {
  const [seenMap, setSeenMap] = useState<SeenMap>(() => readSeenMap());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setSeenMap(readSeenMap());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const markSeen = useCallback((ticket: Ticket) => {
    const timestamp = latestTicketTimestamp(ticket);
    setSeenMap((current) => {
      const next = { ...current, [String(ticket.id)]: timestamp };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isUnread = useCallback(
    (ticket: Ticket) => {
      const seenAt = seenMap[String(ticket.id)] || ticket.created_at;
      return new Date(latestTicketTimestamp(ticket)).getTime() > new Date(seenAt).getTime();
    },
    [seenMap]
  );

  return {
    isUnread,
    latestTicketTimestamp,
    markSeen,
    seenMap
  };
}
