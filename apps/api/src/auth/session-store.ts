import { randomBytes } from 'node:crypto';
import type { SessionInfo } from '@hm-os/contracts';

/**
 * In-memory session store.
 *
 * V1 is single-owner, single-server. Sessions intentionally do not
 * survive an API process restart (the owner re-authenticates), which
 * keeps the security model simple: no session-token persistence to
 * protect on disk. See docs/architecture/SECURITY.md.
 */

interface StoredSession extends SessionInfo {
  lastActivityAt: string;
}

export interface SessionStoreOptions {
  sessionTtlMs: number;
  idleLockMs: number;
  now?: () => Date;
}

export class SessionStore {
  private readonly sessions = new Map<string, StoredSession>();
  private readonly invalidationListeners = new Map<string, Set<() => void>>();

  /** Active resources subscribe once and release the subscription on completion. */
  onInvalidated(sessionId: string, listener: () => void): () => void {
    const listeners = this.invalidationListeners.get(sessionId) ?? new Set<() => void>();
    listeners.add(listener);
    this.invalidationListeners.set(sessionId, listeners);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) this.invalidationListeners.delete(sessionId);
    };
  }

  private invalidate(sessionId: string): void {
    const listeners = this.invalidationListeners.get(sessionId);
    this.invalidationListeners.delete(sessionId);
    for (const listener of listeners ?? []) listener();
  }

  constructor(private readonly options: SessionStoreOptions) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  create(ownerLoginName: string): StoredSession {
    const now = this.now();
    const sessionId = randomBytes(32).toString('base64url');
    const session: StoredSession = {
      sessionId,
      ownerLoginName,
      createdAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.options.sessionTtlMs).toISOString(),
      locked: false,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Returns the session if it exists and has not hard-expired.
   * Applies idle-lock: if the idle window has elapsed, the session is
   * marked locked (but not deleted) as a side effect.
   */
  get(sessionId: string): StoredSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const now = this.now();
    if (now.getTime() >= new Date(session.expiresAt).getTime()) {
      this.destroy(sessionId);
      return undefined;
    }

    const idleFor = now.getTime() - new Date(session.lastActivityAt).getTime();
    if (!session.locked && idleFor >= this.options.idleLockMs) {
      this.lock(sessionId);
    }

    return session;
  }

  touch(sessionId: string): void {
    const session = this.get(sessionId);
    if (!session || session.locked) return;
    session.lastActivityAt = this.now().toISOString();
  }

  lock(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && !session.locked) {
      session.locked = true;
      this.invalidate(sessionId);
    }
  }

  unlock(sessionId: string): boolean {
    const session = this.get(sessionId);
    if (!session) return false;
    session.locked = false;
    session.lastActivityAt = this.now().toISOString();
    return true;
  }

  destroy(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.invalidate(sessionId);
  }

  /** Test/ops helper: number of live (non-expired) sessions. */
  size(): number {
    return this.sessions.size;
  }
}
