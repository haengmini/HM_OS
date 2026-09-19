import { describe, expect, it } from 'vitest';
import { SessionStore } from './session-store.js';

describe('SessionStore', () => {
  it('creates a session that resolves immediately after creation', () => {
    const store = new SessionStore({ sessionTtlMs: 60_000, idleLockMs: 30_000 });
    const created = store.create('owner@example.com');
    const fetched = store.get(created.sessionId);
    expect(fetched?.locked).toBe(false);
    expect(fetched?.ownerLoginName).toBe('owner@example.com');
  });

  it('hard-expires a session after sessionTtlMs regardless of activity', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const store = new SessionStore({
      sessionTtlMs: 1000,
      idleLockMs: 10_000,
      now: () => now,
    });
    const created = store.create('owner@example.com');
    now = new Date(now.getTime() + 2000);
    expect(store.get(created.sessionId)).toBeUndefined();
  });

  it('locks a session after idleLockMs of inactivity', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const store = new SessionStore({
      sessionTtlMs: 60_000,
      idleLockMs: 1000,
      now: () => now,
    });
    const created = store.create('owner@example.com');
    now = new Date(now.getTime() + 2000);
    const fetched = store.get(created.sessionId);
    expect(fetched?.locked).toBe(true);
  });

  it('touch() resets the idle timer for an unlocked session', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const store = new SessionStore({
      sessionTtlMs: 60_000,
      idleLockMs: 1000,
      now: () => now,
    });
    const created = store.create('owner@example.com');
    now = new Date(now.getTime() + 500);
    store.touch(created.sessionId);
    now = new Date(now.getTime() + 600); // total 1100ms since creation, but only 600ms since touch
    const fetched = store.get(created.sessionId);
    expect(fetched?.locked).toBe(false);
  });

  it('unlock() clears the locked flag and destroy() removes the session', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const store = new SessionStore({
      sessionTtlMs: 60_000,
      idleLockMs: 1000,
      now: () => now,
    });
    const created = store.create('owner@example.com');
    store.lock(created.sessionId);
    expect(store.get(created.sessionId)?.locked).toBe(true);

    const unlocked = store.unlock(created.sessionId);
    expect(unlocked).toBe(true);
    expect(store.get(created.sessionId)?.locked).toBe(false);

    store.destroy(created.sessionId);
    expect(store.get(created.sessionId)).toBeUndefined();
  });
});
