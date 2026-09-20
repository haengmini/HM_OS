import type { CSSProperties } from 'react';
import type { OfficeStatusEvent } from '@hm-os/contracts';
import type { RoomDefinition } from './roomLayout.js';
import { AgentTile } from './AgentTile.js';

export interface RoomPanelProps {
  room: RoomDefinition;
  events: OfficeStatusEvent[];
  onOpenTerminal?: () => void;
  onOpenFiles?: () => void;
}

function RoomFurniture({ roomId }: { roomId: string }) {
  return (
    <div className="hm-os-room-furniture" aria-hidden="true">
      {roomId === 'control-room' && <><span className="furniture server-rack rack-a" /><span className="furniture server-rack rack-b" /><span className="furniture holo-table" /></>}
      {roomId === 'agent-workshop' && <><span className="furniture desk desk-a" /><span className="furniture desk desk-b" /><span className="furniture couch" /></>}
      {roomId === 'library' && <><span className="furniture bookshelf shelf-a" /><span className="furniture bookshelf shelf-b" /><span className="furniture reading-table" /></>}
      {roomId === 'project-room' && <><span className="furniture blueprint-table" /><span className="furniture pinboard" /><span className="furniture crate" /></>}
      {roomId === 'terminal-room' && <><span className="furniture terminal-bank" /><span className="furniture portal"><i /></span></>}
      <span className="furniture plant plant-a" /><span className="furniture plant plant-b" />
    </div>
  );
}

export function RoomPanel({ room, events, onOpenTerminal, onOpenFiles }: RoomPanelProps) {
  const roomEvents = room.source ? events.filter((event) => event.source === room.source) : [];
  const activeCount = roomEvents.filter((event) => !['idle', 'offline', 'stale'].includes(event.state)).length;

  return (
    <section
      className="hm-os-room-panel"
      data-room-id={room.id}
      style={{ '--room-accent': room.accent } as CSSProperties}
    >
      <header className="hm-os-room-panel-header">
        <span className="hm-os-room-icon" aria-hidden="true">{room.icon}</span>
        <div><h2>{room.koreanSubtitle}</h2><span className="hm-os-room-panel-title">{room.title}</span></div>
        <span className="hm-os-room-counter">{room.source ? `${activeCount}/${roomEvents.length}` : 'ONLINE'}</span>
      </header>
      <div className="hm-os-room-interior">
        <div className="hm-os-room-wall"><i /><i /><i /></div>
        <div className="hm-os-room-floor" />
        <RoomFurniture roomId={room.id} />
        <div className="hm-os-room-actors">
          {roomEvents.length === 0 && room.source ? (
            <p className="hm-os-room-panel-empty">데이터 신호를 기다리는 중...</p>
          ) : room.source ? (
            roomEvents.map((event, index) => <AgentTile key={`${event.source}:${event.entityId}`} event={event} index={index} />)
          ) : (
            <div className="hm-os-gate-actions">
              <span className="hm-os-gate-title">SERVER LINK ESTABLISHED</span>
              <button type="button" onClick={onOpenTerminal}>터미널 진입</button>
              <button type="button" onClick={onOpenFiles}>파일 보관소</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
