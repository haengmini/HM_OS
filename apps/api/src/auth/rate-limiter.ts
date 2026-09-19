/**
 * Exponential-backoff rate limiter for PIN login attempts, keyed by
 * owner login name (there is only ever one owner in V1, but keying by
 * identity keeps this correct if that ever changes).
 */
export interface RateLimiterOptions {
  maxFailuresBeforeBackoff: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  now?: () => Date;
}

interface AttemptState {
  failureCount: number;
  blockedUntil: number | null;
}

export class LoginRateLimiter {
  private readonly state = new Map<string, AttemptState>();
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(private readonly options: RateLimiterOptions) {
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 5 * 60 * 1000;
  }

  private now(): number {
    return (this.options.now ? this.options.now() : new Date()).getTime();
  }

  /** Returns milliseconds remaining until this key may attempt again, or 0 if allowed now. */
  msUntilAllowed(key: string): number {
    const entry = this.state.get(key);
    if (!entry?.blockedUntil) return 0;
    const remaining = entry.blockedUntil - this.now();
    return remaining > 0 ? remaining : 0;
  }

  recordFailure(key: string): void {
    const entry = this.state.get(key) ?? { failureCount: 0, blockedUntil: null };
    entry.failureCount += 1;
    if (entry.failureCount >= this.options.maxFailuresBeforeBackoff) {
      const overBy = entry.failureCount - this.options.maxFailuresBeforeBackoff;
      const delay = Math.min(this.baseDelayMs * 2 ** overBy, this.maxDelayMs);
      entry.blockedUntil = this.now() + delay;
    }
    this.state.set(key, entry);
  }

  recordSuccess(key: string): void {
    this.state.delete(key);
  }
}
