/**
 * HM OS API runtime configuration.
 *
 * All values are overridable via environment variables so the exact
 * same code can run against:
 *  - production (Tailscale Serve → loopback, real MagicDNS hostname)
 *  - local dev/test (loopback host, matching the test harness's own
 *    request Host header — NOT a security bypass, just a different
 *    expected value for the same check).
 *
 * There is intentionally no "insecure bypass" flag: the Tailscale
 * identity + Host check always runs; only the *expected* values are
 * configurable.
 */

export interface HmOsConfig {
  /** Tailscale login name that is allowed to use HM OS. */
  ownerLoginName: string;
  /** Expected Host header (Tailscale MagicDNS name, with port in dev). */
  expectedHost: string;
  /** Directory for persisted auth state (PIN hash, audit log). Mode 0700. */
  dataDir: string;
  /** Session lifetime from creation, regardless of activity. */
  sessionTtlMs: number;
  /** Idle time before a session is auto-locked. */
  idleLockMs: number;
  /** Whether to set the `Secure` cookie attribute (disable only for local http dev/test). */
  cookieSecure: boolean;
  /** Max failed PIN attempts before exponential backoff kicks in. */
  maxFailuresBeforeBackoff: number;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === 'true' || raw === '1';
}

export function loadConfig(): HmOsConfig {
  return {
    ownerLoginName: process.env.HM_OS_OWNER_LOGIN ?? 'ihyeongmin00@gmail.com',
    expectedHost: process.env.HM_OS_TAILNET_HOSTNAME ?? 'hm-os-server.taila8b4a0.ts.net',
    dataDir: process.env.HM_OS_DATA_DIR ?? new URL('../data', import.meta.url).pathname,
    sessionTtlMs: envInt('HM_OS_SESSION_TTL_MS', 12 * 60 * 60 * 1000),
    idleLockMs: envInt('HM_OS_IDLE_LOCK_MS', 10 * 60 * 1000),
    cookieSecure: envBool('HM_OS_COOKIE_SECURE', true),
    maxFailuresBeforeBackoff: envInt('HM_OS_MAX_FAILURES_BEFORE_BACKOFF', 3),
  };
}
