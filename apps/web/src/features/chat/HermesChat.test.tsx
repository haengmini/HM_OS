import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HermesChat } from './HermesChat.js';

vi.mock('thinking-orbs', () => ({ ThinkingOrb: () => <span>orb</span> }));
const LEGACY_KEY = 'hm-os-chat-preview';

describe('Hermes chat privacy', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('removes legacy persisted messages instead of restoring them without PIN protection', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify([{ id: 'old', role: 'user', content: 'private legacy message' }]));
    render(<HermesChat onClose={() => {}} />);
    expect(screen.queryByText('private legacy message')).not.toBeInTheDocument();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('keeps a new conversation only in memory and discards it on unmount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'test offline' }) }));
    const first = render(<HermesChat onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Hermes에게 메시지 보내기...'), { target: { value: 'private new message' } });
    fireEvent.click(screen.getByRole('button', { name: '전송' }));
    await waitFor(() => expect(screen.getByText(/test offline/)).toBeInTheDocument());
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    first.unmount();
    render(<HermesChat onClose={() => {}} />);
    expect(screen.queryByText('private new message')).not.toBeInTheDocument();
  });
});
