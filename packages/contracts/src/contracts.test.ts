import { describe, expect, it } from 'vitest';
import type { OfficeStatusEvent } from './status.js';
import type { AuthFailure } from './auth.js';

describe('contracts', () => {
  it('accepts a well-formed OfficeStatusEvent', () => {
    const event: OfficeStatusEvent = {
      source: 'system',
      entityId: 'server-1',
      state: 'idle',
      observedAt: new Date().toISOString(),
      confidence: 'fresh',
    };
    expect(event.source).toBe('system');
  });

  it('accepts a well-formed AuthFailure', () => {
    const failure: AuthFailure = {
      reason: 'invalid_pin',
      message: 'PIN mismatch',
    };
    expect(failure.reason).toBe('invalid_pin');
  });
});
