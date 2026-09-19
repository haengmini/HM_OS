import { useState } from 'react';
import { ROOM_DEFINITIONS } from './roomLayout.js';
import { RoomPanel } from './RoomPanel.js';
import { useOfficeStatus } from './useOfficeStatus.js';
import { TerminalPanel } from '../terminal/TerminalPanel.js';
import { FileExplorer } from '../files/FileExplorer.js';

const CONNECTION_LABELS_KO: Record<string, string> = {
  connecting: '연결 중...', open: '연결됨', reconnecting: '재연결 중...', closed: '연결 끊김',
};
type View = 'office' | 'terminal' | 'files';

export function PixelOffice() {
  const { events, connectionState } = useOfficeStatus();
  const [view, setView] = useState<View>('office');

  return (
    <div className="hm-os-pixel-office">
      <header className="hm-os-pixel-office-header">
        <h1>HM OS</h1>
        <nav className="hm-os-main-nav" aria-label="HM OS 기능">
          <button type="button" aria-pressed={view === 'office'} onClick={() => setView('office')}>오피스</button>
          <button type="button" aria-pressed={view === 'terminal'} onClick={() => setView('terminal')}>터미널</button>
          <button type="button" aria-pressed={view === 'files'} onClick={() => setView('files')}>파일</button>
        </nav>
        <span className="hm-os-connection-badge" data-connection-state={connectionState}>
          {CONNECTION_LABELS_KO[connectionState] ?? connectionState}
        </span>
      </header>
      {view === 'office' && (
        <div className="hm-os-pixel-office-grid">
          {ROOM_DEFINITIONS.map((room) => <RoomPanel key={room.id} room={room} events={events} />)}
        </div>
      )}
      {view === 'terminal' && <TerminalPanel />}
      {view === 'files' && <FileExplorer />}
    </div>
  );
}
