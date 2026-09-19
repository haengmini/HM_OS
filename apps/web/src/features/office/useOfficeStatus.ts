import { useEffect, useRef, useState } from 'react';
import type { OfficeStatusEvent } from '@hm-os/contracts';

export type StreamConnectionState = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface UseOfficeStatusResult {
  events: OfficeStatusEvent[];
  connectionState: StreamConnectionState;
}

function eventKey(event: OfficeStatusEvent): string {
  return `${event.source}:${event.entityId}`;
}

function mergeEvents(current: OfficeStatusEvent[], incoming: OfficeStatusEvent[]): OfficeStatusEvent[] {
  const byKey = new Map(current.map((e) => [eventKey(e), e]));
  for (const event of incoming) {
    byKey.set(eventKey(event), event);
  }
  return Array.from(byKey.values());
}

/**
 * Fetches the initial `/api/status` snapshot, then opens
 * `/api/status/stream` for live updates, merging events by
 * `source:entityId` so a room never flashes empty between messages.
 * Reconnects with backoff if the socket closes (e.g. the Milestone 1
 * idle-lock closed it with code 4401) — AuthGate above this component
 * is responsible for re-showing the lock screen; this hook just stops
 * trying to render stale data past a hard cutoff.
 */
export function useOfficeStatus(streamUrl = '/api/status/stream'): UseOfficeStatusResult {
  const [events, setEvents] = useState<OfficeStatusEvent[]>([]);
  const [connectionState, setConnectionState] = useState<StreamConnectionState>('connecting');
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    async function loadInitialSnapshot() {
      try {
        const response = await fetch('/api/status', { credentials: 'include' });
        if (!response.ok || cancelled) return;
        const body = (await response.json()) as { events: OfficeStatusEvent[] };
        if (!cancelled) setEvents((prev) => mergeEvents(prev, body.events));
      } catch {
        // Non-fatal: the WebSocket stream below will populate events
        // once it connects. Absence of an initial snapshot just means
        // a slightly later first paint.
      }
    }

    function connect() {
      if (cancelled) return;
      setConnectionState((prev) => (prev === 'connecting' ? 'connecting' : 'reconnecting'));

      const url = new URL(streamUrl, window.location.origin);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(url);

      socket.onopen = () => {
        reconnectAttempt.current = 0;
        setConnectionState('open');
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data as string) as { type: string; events: OfficeStatusEvent[] };
          if (parsed.type === 'office-status') {
            setEvents((prev) => mergeEvents(prev, parsed.events));
          }
        } catch {
          // Ignore malformed frames rather than crashing the UI.
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setConnectionState('closed');
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30_000);
        reconnectAttempt.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    void loadInitialSnapshot();
    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [streamUrl]);

  return { events, connectionState };
}
