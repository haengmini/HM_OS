import type { OfficeStatusEvent } from '@hm-os/contracts';

/**
 * Synthetic office status events for integration tests (Milestone 2+).
 * These are NOT real server data — used only so tests never depend on
 * the live Agent OS / Wiki / system state.
 */
export const syntheticOfficeEvents: OfficeStatusEvent[] = [
  {
    source: 'system',
    entityId: 'server-main',
    state: 'idle',
    observedAt: '2026-01-01T00:00:00.000Z',
    confidence: 'fresh',
  },
  {
    source: 'agent-os',
    entityId: 'profile-coder',
    state: 'working',
    detail: 'Implementing terminal panel',
    sourcePath: '/opt/data/profiles/coder/SOUL.md',
    observedAt: '2026-01-01T00:00:05.000Z',
    confidence: 'fresh',
  },
];
