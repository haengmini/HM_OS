import { useState } from 'react';
import { ROOM_DEFINITIONS } from './roomLayout.js';
import { RoomPanel } from './RoomPanel.js';
import { useOfficeStatus } from './useOfficeStatus.js';
import { TerminalPanel } from '../terminal/TerminalPanel.js';
import { FileExplorer } from '../files/FileExplorer.js';

const CONNECTION_LABELS_KO: Record<string, string> = {
  connecting: '링크 연결 중', open: '월드 온라인', reconnecting: '링크 복구 중', closed: '월드 오프라인',
};
type View = 'office' | 'terminal' | 'files';

export function PixelOffice() {
  const { events, connectionState } = useOfficeStatus();
  const [view, setView] = useState<View>('office');
  const active = events.filter((event) => ['working', 'researching', 'executing', 'syncing'].includes(event.state)).length;
  const warnings = events.filter((event) => ['error', 'offline', 'stale'].includes(event.state)).length;
  const latest = events.reduce((value, event) => event.observedAt > value ? event.observedAt : value, '');
  const observedTime = latest ? new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date(latest)) : '--:--';

  return (
    <div className="hm-os-game-shell">
      <div className="hm-os-skyline" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="hm-os-pixel-office">
        <header className="hm-os-pixel-office-header">
          <div className="hm-os-brand-lockup">
            <span className="hm-os-brand-gem" aria-hidden="true">H</span>
            <div><span className="hm-os-brand-kicker">PERSONAL AGENT WORLD</span><h1>HM OS</h1></div>
          </div>
          <div className="hm-os-world-hud" aria-label="월드 현황">
            <span><b>{events.length}</b> ENTITY</span>
            <span><b>{active}</b> ACTIVE</span>
            <span data-warning={warnings > 0}><b>{warnings}</b> ALERT</span>
            <span><b>{observedTime}</b> SYNC</span>
          </div>
          <span className="hm-os-connection-badge" data-connection-state={connectionState}>
            <i />{CONNECTION_LABELS_KO[connectionState] ?? connectionState}
          </span>
        </header>

        <main className="hm-os-game-screen">
          {view === 'office' && (
            <>
              <div className="hm-os-world-titlebar">
                <div><span>WORLD 01</span><h2>Agent Operations HQ</h2></div>
                <p>실제 서버와 에이전트의 현재 활동이 이 공간에 실시간으로 반영됩니다.</p>
              </div>
              <div className="hm-os-pixel-office-grid">
                {ROOM_DEFINITIONS.map((room) => (
                  <RoomPanel
                    key={room.id}
                    room={room}
                    events={events}
                    onOpenTerminal={() => setView('terminal')}
                    onOpenFiles={() => setView('files')}
                  />
                ))}
                <div className="hm-os-office-corridor" aria-hidden="true"><span>◆</span><i /><i /><i /><span>◆</span></div>
              </div>
            </>
          )}
          {view === 'terminal' && <TerminalPanel />}
          {view === 'files' && <FileExplorer />}
        </main>

        <nav className="hm-os-main-nav" aria-label="HM OS 기능">
          <button type="button" aria-pressed={view === 'office'} onClick={() => setView('office')}><span aria-hidden="true">▦</span><b>오피스</b><small>WORLD</small></button>
          <button type="button" aria-pressed={view === 'terminal'} onClick={() => setView('terminal')}><span aria-hidden="true">›_</span><b>터미널</b><small>CONSOLE</small></button>
          <button type="button" aria-pressed={view === 'files'} onClick={() => setView('files')}><span aria-hidden="true">▤</span><b>파일</b><small>ARCHIVE</small></button>
        </nav>
      </div>
    </div>
  );
}
