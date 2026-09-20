import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PixelOffice } from './PixelOffice.js';

class FakeWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string | URL) {}
  send() {}
  close() {
    this.onclose?.();
  }
}

describe('PixelOffice', () => {
  beforeEach(() => {
    localStorage.setItem('hm-os-device-profile', 'acer-nitro-linux');
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: Parameters<typeof fetch>[0]) => {
        const url = String(input);
        if (url.includes('/api/devices')) return { ok: true, json: async () => ({ devices: [] }) };
        return { ok: true, json: async () => ({
          events: [
            {
              source: 'system',
              entityId: 'server-main',
              state: 'idle',
              observedAt: new Date().toISOString(),
              confidence: 'fresh',
            },
            {
              source: 'agent-os',
              entityId: 'coder',
              state: 'working',
              detail: 'Implement terminal panel',
              observedAt: new Date().toISOString(),
              confidence: 'fresh',
            },
          ],
        }) };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders one colony map with real NPCs and interactive facilities', async () => {
    render(<PixelOffice />);

    expect(screen.getByRole('application', { name: /WASD/ })).toBeInTheDocument();
    expect(screen.getByText(/TOWN HALL/)).toBeInTheDocument();
    expect(screen.getByText(/RESIDENT SERVICES/)).toBeInTheDocument();
    expect(document.querySelector('[data-map-object="terminal"]')).toBeInTheDocument();
    expect(document.querySelector('[data-map-object="chat"]')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('server-main')).toBeInTheDocument());
    expect(screen.getByText('coder')).toBeInTheDocument();
  });
});
