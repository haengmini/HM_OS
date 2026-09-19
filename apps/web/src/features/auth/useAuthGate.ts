import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAuthStatus, type AuthStatus } from './api.js';

export type AuthPhase =
  | 'checking'
  | 'setup-required'
  | 'login-required'
  | 'locked'
  | 'unlocked'
  | 'denied';

export interface AuthGateState {
  phase: AuthPhase;
  refresh: () => Promise<void>;
}

/**
 * Polls `/api/auth/status` and derives a single phase the UI can
 * branch on. Also re-checks on window focus/visibility change so a
 * session that expired or was locked in another tab is reflected
 * promptly (Milestone 1 requirement: idle/lock state must not be
 * stale in the UI).
 */
export function useAuthGate(pollMs = 15_000): AuthGateState {
  const [phase, setPhase] = useState<AuthPhase>('checking');
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    let status: AuthStatus;
    try {
      status = await fetchAuthStatus();
    } catch {
      if (mounted.current) setPhase('denied');
      return;
    }
    if (!mounted.current) return;

    if (!status.pinConfigured) {
      setPhase('setup-required');
    } else if (status.locked) {
      setPhase('locked');
    } else if (status.authenticated) {
      setPhase('unlocked');
    } else {
      setPhase('login-required');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();

    const interval = setInterval(() => void refresh(), pollMs);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh, pollMs]);

  return { phase, refresh };
}
