import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOfficeStatus } from './useOfficeStatus.js';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string | URL) {
    FakeWebSocket.instances.push(this);
  }

  send() {
    /* not used by this hook */
  }

  close() {
    this.closed = true;
    this.onclose?.();
  }

  emitOpen() {
    this.onopen?.();
  }

  emitMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

describe('useOfficeStatus', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          events: [
            {
              source: 'system',
              entityId: 'server-main',
              state: 'idle',
              observedAt: new Date().toISOString(),
              confidence: 'fresh',
            },
          ],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the initial REST snapshot', async () => {
    const { result } = renderHook(() => useOfficeStatus());
    await waitFor(() => expect(result.current.events).toHaveLength(1));
    expect(result.current.events[0]!.entityId).toBe('server-main');
  });

  it('merges WebSocket updates by source:entityId, deduping repeats', async () => {
    const { result } = renderHook(() => useOfficeStatus());
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    const socket = FakeWebSocket.instances[0]!;
    socket.emitOpen();

    socket.emitMessage({
      type: 'office-status',
      events: [
        {
          source: 'agent-os',
          entityId: 'coder',
          state: 'working',
          observedAt: new Date().toISOString(),
          confidence: 'fresh',
        },
      ],
    });

    await waitFor(() => expect(result.current.connectionState).toBe('open'));
    await waitFor(() =>
      expect(result.current.events.some((e) => e.entityId === 'coder')).toBe(true),
    );

    // A repeat update for the same key should replace, not duplicate.
    socket.emitMessage({
      type: 'office-status',
      events: [
        {
          source: 'agent-os',
          entityId: 'coder',
          state: 'idle',
          observedAt: new Date().toISOString(),
          confidence: 'fresh',
        },
      ],
    });

    await waitFor(() => {
      const coderEvents = result.current.events.filter((e) => e.entityId === 'coder');
      expect(coderEvents).toHaveLength(1);
      expect(coderEvents[0]!.state).toBe('idle');
    });
  });
});
