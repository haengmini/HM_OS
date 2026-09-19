import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App.js';

describe('App shell', () => {
  beforeEach(() => {
    // Milestone 1: App now mounts AuthGate, which calls fetch() on
    // mount. Mock it to the "denied" path (no auth backend in this
    // unit test) so we can still assert the shell renders something
    // deterministic without a real API server.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('no api server in unit test')),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the auth gate while checking, without crashing', async () => {
    render(<App />);
    expect(await screen.findByText(/HM OS에 접근할 수 없습니다/)).toBeInTheDocument();
  });
});
