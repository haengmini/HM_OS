import { describe, expect, it } from 'vitest';
import { DevicePresenceStore } from './device-presence.js';

describe('DevicePresenceStore', () => {
  it('tracks named device characters and marks stale devices offline', () => {
    let now = new Date('2026-01-01T00:00:00Z');
    const store = new DevicePresenceStore(() => now, 30_000);
    store.update('acer-nitro-windows', { x: 12, y: 8, facing: 'right' });
    expect(store.list()[0]).toMatchObject({ label: 'Acer Nitro · Windows', platform: 'windows', online: true });
    now = new Date('2026-01-01T00:01:00Z');
    expect(store.list()[0]?.online).toBe(false);
  });

  it('clamps positions to the colony bounds', () => {
    const store = new DevicePresenceStore();
    expect(store.update('iphone', { x: 99, y: -3, facing: 'up' })).toMatchObject({ x: 29, y: 0, platform: 'ios' });
  });
});
