import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OfficeStatusEvent } from '@hm-os/contracts';
import { RoomPanel } from './RoomPanel.js';
import { ROOM_DEFINITIONS } from './roomLayout.js';

const controlRoom = ROOM_DEFINITIONS.find((r) => r.id === 'control-room')!;
const terminalRoom = ROOM_DEFINITIONS.find((r) => r.id === 'terminal-room')!;

function makeEvent(overrides: Partial<OfficeStatusEvent> = {}): OfficeStatusEvent {
  return {
    source: 'system',
    entityId: 'server-main',
    state: 'idle',
    observedAt: new Date().toISOString(),
    confidence: 'fresh',
    ...overrides,
  };
}

describe('RoomPanel', () => {
  it('renders a matching event as a tile', () => {
    render(<RoomPanel room={controlRoom} events={[makeEvent()]} />);
    expect(screen.getByText('관제실')).toBeInTheDocument();
    expect(screen.getByText('server-main')).toBeInTheDocument();
  });

  it('filters out events from other sources', () => {
    render(<RoomPanel room={controlRoom} events={[makeEvent({ source: 'wiki', entityId: 'second-brain' })]} />);
    expect(screen.queryByText('second-brain')).not.toBeInTheDocument();
    expect(screen.getByText('데이터 신호를 기다리는 중...')).toBeInTheDocument();
  });

  it('shows live terminal and file controls in the control gate', () => {
    render(<RoomPanel room={terminalRoom} events={[]} />);
    expect(screen.getByText('SERVER LINK ESTABLISHED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '터미널 진입' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파일 보관소' })).toBeInTheDocument();
  });
});
