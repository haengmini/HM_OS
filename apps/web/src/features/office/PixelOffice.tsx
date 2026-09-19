import { ROOM_DEFINITIONS } from './roomLayout.js';
import { RoomPanel } from './RoomPanel.js';
import { useOfficeStatus } from './useOfficeStatus.js';

const CONNECTION_LABELS_KO: Record<string, string> = {
  connecting: '연결 중...',
  open: '연결됨',
  reconnecting: '재연결 중...',
  closed: '연결 끊김',
};

/**
 * Milestone 3 root: the 2D pixel office. Renders a fixed grid of
 * rooms (docs/product/V1_SCOPE.md's "관제실 / 에이전트 작업실 / 도서관 /
 * 프로젝트룸" plus a Milestone-4-reserved Terminal Room), each backed
 * by real Milestone 2 data via `useOfficeStatus`.
 */
export function PixelOffice() {
  const { events, connectionState } = useOfficeStatus();

  return (
    <div className="hm-os-pixel-office">
      <header className="hm-os-pixel-office-header">
        <h1>HM OS</h1>
        <span
          className="hm-os-connection-badge"
          data-connection-state={connectionState}
        >
          {CONNECTION_LABELS_KO[connectionState] ?? connectionState}
        </span>
      </header>
      <div className="hm-os-pixel-office-grid">
        {ROOM_DEFINITIONS.map((room) => (
          <RoomPanel key={room.id} room={room} events={events} />
        ))}
      </div>
    </div>
  );
}
