import { describe, expect, it } from 'vitest';
import { LoginRateLimiter } from './rate-limiter.js';

describe('LoginRateLimiter', () => {
  it('allows attempts until the failure threshold is reached', () => {
    const limiter = new LoginRateLimiter({ maxFailuresBeforeBackoff: 3 });
    limiter.recordFailure('owner');
    limiter.recordFailure('owner');
    expect(limiter.msUntilAllowed('owner')).toBe(0);
  });

  it('blocks further attempts once the threshold is exceeded', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const limiter = new LoginRateLimiter({
      maxFailuresBeforeBackoff: 2,
      baseDelayMs: 1000,
      now: () => now,
    });
    limiter.recordFailure('owner');
    limiter.recordFailure('owner');
    expect(limiter.msUntilAllowed('owner')).toBeGreaterThan(0);
  });

  it('increases the delay exponentially with more failures', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const limiter = new LoginRateLimiter({
      maxFailuresBeforeBackoff: 1,
      baseDelayMs: 1000,
      maxDelayMs: 100_000,
      now: () => now,
    });
    limiter.recordFailure('owner');
    const firstWait = limiter.msUntilAllowed('owner');
    limiter.recordFailure('owner');
    const secondWait = limiter.msUntilAllowed('owner');
    expect(secondWait).toBeGreaterThan(firstWait);
  });

  it('resets on success', () => {
    const limiter = new LoginRateLimiter({ maxFailuresBeforeBackoff: 1, baseDelayMs: 1000 });
    limiter.recordFailure('owner');
    limiter.recordSuccess('owner');
    expect(limiter.msUntilAllowed('owner')).toBe(0);
  });
});
