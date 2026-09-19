import type { OfficeStatusEvent } from '@hm-os/contracts';
import type { RoomDefinition } from './roomLayout.js';
import { AgentTile } from './AgentTile.js';

export interface RoomPanelProps {
  room: RoomDefinition;
  events: OfficeStatusEvent[];
}

/**
 * One room in the office grid. Renders every event whose `source`
 * matches this room's mapped OfficeSource; an empty room (no matching
 * events yet, or a Milestone-4-only room like Terminal Room) shows a
 * placeholder instead of nothing, so the operator can tell "no data
 * yet" apart from "broken render".
 */
export function RoomPanel({ room, events }: RoomPanelProps) {
  const roomEvents = room.source ? events.filter((e) => e.source === room.source) : [];

  return (
    <section className="hm-os-room-panel" data-room-id={room.id}>
      <header className="hm-os-room-panel-header">
        <h2>{room.koreanSubtitle}</h2>
        <span className="hm-os-room-panel-title">{room.title}</span>
      </header>
      <div className="hm-os-room-panel-grid">
        {roomEvents.length === 0 ? (
          <p className="hm-os-room-panel-empty">
            {room.source ? '데이터 대기 중...' : 'Milestone 4에서 활성화됩니다.'}
          </p>
        ) : (
          roomEvents.map((event) => <AgentTile key={`${event.source}:${event.entityId}`} event={event} />)
        )}
      </div>
    </section>
  );
}
