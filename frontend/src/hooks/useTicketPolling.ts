import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { Ticket } from "../types";

interface UseTicketPollingOptions {
  enabled?: boolean;
  fetchTicket: () => Promise<Ticket>;
  intervalMs?: number;
  onTicket?: (ticket: Ticket) => void;
  setTicket: Dispatch<SetStateAction<Ticket | null>>;
  ticket: Ticket | null;
}

function mergeTicket(current: Ticket | null, incoming: Ticket) {
  if (!current) return incoming;

  const serverComments = incoming.comments || [];
  const localComments = (current.comments || []).filter((comment) => comment.id < 0);
  const serverIds = new Set(serverComments.map((comment) => comment.id));
  const pendingComments = localComments.filter((comment) => !serverIds.has(comment.id));

  return {
    ...incoming,
    comments: [...serverComments, ...pendingComments].sort(
      (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
    )
  };
}

export function useTicketPolling({
  enabled = true,
  fetchTicket,
  intervalMs = 5000,
  onTicket,
  setTicket,
  ticket
}: UseTicketPollingOptions) {
  const [syncing, setSyncing] = useState(false);
  const fetchRef = useRef(fetchTicket);
  const onTicketRef = useRef(onTicket);

  useEffect(() => {
    fetchRef.current = fetchTicket;
  }, [fetchTicket]);

  useEffect(() => {
    onTicketRef.current = onTicket;
  }, [onTicket]);

  const refetchTicket = useCallback(async () => {
    if (!enabled) return null;

    setSyncing(true);
    try {
      const incoming = await fetchRef.current();
      setTicket((current) => mergeTicket(current, incoming));
      onTicketRef.current?.(incoming);
      return incoming;
    } finally {
      setSyncing(false);
    }
  }, [enabled, setTicket]);

  useEffect(() => {
    if (!enabled || !ticket) return;

    const interval = window.setInterval(() => {
      refetchTicket().catch(() => {
        setSyncing(false);
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [enabled, intervalMs, refetchTicket, ticket]);

  return {
    refetchTicket,
    syncing
  };
}
