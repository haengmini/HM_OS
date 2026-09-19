import { describe, expect, it } from 'vitest';
import { readSystemSnapshot, toOfficeStatusEvent } from './system-adapter.js';

describe('system-adapter', () => {
  it('reads real OS system stats without throwing', async () => {
    const snapshot = await readSystemSnapshot('/');
    expect(snapshot.cpuCount).toBeGreaterThan(0);
    expect(snapshot.totalMemBytes).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.loadAverage)).toBe(true);
  });

  it('gracefully omits disk fields for a nonexistent path', async () => {
    const snapshot = await readSystemSnapshot('/this/path/does/not/exist/hm-os');
    expect(snapshot.diskTotalBytes).toBeUndefined();
    expect(snapshot.diskUsedFraction).toBeUndefined();
  });

  it('maps a normal snapshot to an idle office status event', () => {
    const event = toOfficeStatusEvent(
      {
        loadAverage: [0.1, 0.1, 0.1],
        cpuCount: 8,
        totalMemBytes: 16_000_000_000,
        freeMemBytes: 8_000_000_000,
        usedMemFraction: 0.5,
        uptimeSeconds: 1000,
        diskTotalBytes: 100_000_000_000,
        diskFreeBytes: 50_000_000_000,
        diskUsedFraction: 0.5,
      },
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(event.source).toBe('system');
    expect(event.entityId).toBe('server-main');
    expect(event.state).toBe('idle');
    expect(event.confidence).toBe('fresh');
  });

  it('maps a high-load snapshot to an error office status event', () => {
    const event = toOfficeStatusEvent(
      {
        loadAverage: [50, 40, 30],
        cpuCount: 8,
        totalMemBytes: 16_000_000_000,
        freeMemBytes: 8_000_000_000,
        usedMemFraction: 0.5,
        uptimeSeconds: 1000,
      },
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(event.state).toBe('error');
  });
});
