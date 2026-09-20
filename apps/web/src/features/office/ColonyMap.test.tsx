import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ColonyMap } from './ColonyMap.js';

vi.mock('./useDevicePresence.js', () => ({ useDevicePresence: () => [] }));

function currentLeft(container: HTMLElement) {
  const el = container.querySelector('.hm-os-device-character[data-current="true"]') as HTMLElement;
  return parseFloat(el.style.left);
}

describe('ColonyMap movement', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ devices: [] }) })); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('moves one tile per fixed tick while a direction key is held, never accelerating', () => {
    const { container } = render(<ColonyMap events={[]} deviceId="acer-nitro-linux" onInteract={() => {}} />);
    const start = currentLeft(container);

    act(() => { fireEvent.keyDown(window, { key: 'ArrowRight' }); });
    const deltas: number[] = [];
    let previous = start;
    for (let tick = 0; tick < 5; tick += 1) {
      act(() => { vi.advanceTimersByTime(220); });
      const next = currentLeft(container);
      deltas.push(next - previous);
      previous = next;
    }
    act(() => { fireEvent.keyUp(window, { key: 'ArrowRight' }); });

    // Every tick advances by the same tile width — constant speed, no ramp-up.
    for (const delta of deltas) {
      expect(delta).toBeCloseTo(deltas[0]!, 5);
    }
    expect(deltas[0]).toBeGreaterThan(0);
  });

  it('stops advancing as soon as the key is released', () => {
    const { container } = render(<ColonyMap events={[]} deviceId="acer-nitro-linux" onInteract={() => {}} />);
    act(() => { fireEvent.keyDown(window, { key: 'ArrowRight' }); });
    act(() => { vi.advanceTimersByTime(220); });
    act(() => { fireEvent.keyUp(window, { key: 'ArrowRight' }); });
    const afterRelease = currentLeft(container);
    act(() => { vi.advanceTimersByTime(220 * 3); });
    expect(currentLeft(container)).toBeCloseTo(afterRelease, 5);
  });
});
