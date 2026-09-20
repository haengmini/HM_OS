import { describe, expect, it } from 'vitest';
import { findPath, isWalkable, nearestInteraction } from './colonyMap.js';

describe('colonyMap', () => {
  it('blocks solid furniture and map boundaries', () => {
    expect(isWalkable({ x: -1, y: 0 })).toBe(false);
    expect(isWalkable({ x: 2, y: 2 })).toBe(false);
    expect(isWalkable({ x: 14, y: 9 })).toBe(true);
  });

  it('finds a walkable path around furniture', () => {
    const path = findPath({ x: 14, y: 9 }, { x: 18, y: 12 });
    expect(path.length).toBeGreaterThan(0);
    expect(path.every(isWalkable)).toBe(true);
  });

  it('offers interaction only near a facility', () => {
    expect(nearestInteraction({ x: 16, y: 5 })?.kind).toBe('chat');
    expect(nearestInteraction({ x: 14, y: 9 })).toBeNull();
  });
});
