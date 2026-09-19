import { describe, expect, it } from 'vitest';
import { ROOM_DEFINITIONS, roomForSource, colorForState, labelForState, opacityForConfidence } from './roomLayout.js';

describe('roomLayout', () => {
  it('defines exactly one room per Milestone 2 data source, plus the reserved Milestone 4 room', () => {
    expect(ROOM_DEFINITIONS).toHaveLength(5);
    const sourced = ROOM_DEFINITIONS.filter((r) => r.source !== null);
    expect(sourced).toHaveLength(4);
    const reserved = ROOM_DEFINITIONS.filter((r) => r.source === null);
    expect(reserved).toHaveLength(1);
  });

  it('roomForSource finds the correct room for each real source', () => {
    expect(roomForSource('system').id).toBe('control-room');
    expect(roomForSource('agent-os').id).toBe('agent-workshop');
    expect(roomForSource('wiki').id).toBe('library');
    expect(roomForSource('recent-docs').id).toBe('project-room');
  });

  it('colorForState and labelForState cover every OfficeState without throwing', () => {
    const states = ['idle', 'working', 'researching', 'executing', 'syncing', 'error', 'offline', 'stale'] as const;
    for (const state of states) {
      expect(colorForState(state)).toMatch(/^#[0-9a-f]{6}$/);
      expect(labelForState(state).length).toBeGreaterThan(0);
    }
  });

  it('opacityForConfidence dims stale/unknown data', () => {
    expect(opacityForConfidence('fresh')).toBe(1);
    expect(opacityForConfidence('stale')).toBeLessThan(1);
    expect(opacityForConfidence('unknown')).toBeLessThan(opacityForConfidence('stale'));
  });
});
