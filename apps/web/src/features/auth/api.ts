import type { AuthFailure } from '@hm-os/contracts';

/**
 * Thin client for the HM OS auth API. Uses `credentials: 'include'`
 * so the HttpOnly session cookie round-trips; never reads or stores
 * the cookie value in JS.
 */

export interface AuthStatus {
  pinConfigured: boolean;
  authenticated: boolean;
  locked: boolean;
}

export type AuthResult = { ok: true } | { ok: false; failure: AuthFailure & { httpStatus: number } };

async function postJson(url: string, body: unknown): Promise<AuthResult> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (response.ok) return { ok: true };
  const failure = (await response.json()) as AuthFailure;
  return { ok: false, failure: { ...failure, httpStatus: response.status } };
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const response = await fetch('/api/auth/status', { credentials: 'include' });
  if (!response.ok) {
    // A non-200 here (e.g. Tailscale identity mismatch) means this
    // browser/device is not recognized at all — treat as locked-out.
    return { pinConfigured: false, authenticated: false, locked: false };
  }
  return (await response.json()) as AuthStatus;
}

export function setupPin(pin: string): Promise<AuthResult> {
  return postJson('/api/auth/setup-pin', { pin });
}

export function login(pin: string): Promise<AuthResult> {
  return postJson('/api/auth/login', { pin });
}

export function unlock(pin: string): Promise<AuthResult> {
  return postJson('/api/auth/unlock', { pin });
}

export function lock(): Promise<AuthResult> {
  return postJson('/api/auth/lock', {});
}

export function logout(): Promise<AuthResult> {
  return postJson('/api/auth/logout', {});
}
