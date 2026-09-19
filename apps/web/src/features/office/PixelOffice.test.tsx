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
            {
              source: 'agent-os',
              entityId: 'coder',
              state: 'working',
              detail: 'Implement terminal panel',
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

  it('renders all five rooms and places real events into the correct room', async () => {
    render(<PixelOffice />);

    expect(screen.getByText('관제실')).toBeInTheDocument();
    expect(screen.getByText('에이전트 작업실')).toBeInTheDocument();
    expect(screen.getByText('도서관')).toBeInTheDocument();
    expect(screen.getByText('프로젝트룸')).toBeInTheDocument();
    expect(screen.getByText('터미널룸 (Milestone 4)')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('server-main')).toBeInTheDocument());
    expect(screen.getByText('coder')).toBeInTheDocument();
  });
});
