import { useState } from 'react';
import type { DeviceProfileId } from '@hm-os/contracts';
import { useOfficeStatus } from './useOfficeStatus.js';
import { ColonyMap } from './ColonyMap.js';
import type { ColonyObject } from './colonyMap.js';
import { DeviceSetup } from './DeviceSetup.js';
import { clearDeviceProfile, loadDeviceProfile, saveDeviceProfile } from './useDevicePresence.js';
import { TerminalPanel } from '../terminal/TerminalPanel.js';
import { FileExplorer } from '../files/FileExplorer.js';
import { HermesChat } from '../chat/HermesChat.js';
import { ChatIcon, ColonyIcon, FilesIcon, TerminalIcon } from '../../assets/icons/index.js';

const CONNECTION_LABELS_KO: Record<string, string> = {
  connecting: '링크 연결 중', open: '그리드 온라인', reconnecting: '링크 복구 중', closed: '그리드 오프라인',
};
type View = 'colony' | 'terminal' | 'files';

export function PixelOffice() {
  const { events, connectionState } = useOfficeStatus();
  const [view, setView] = useState<View>('colony');
  const [chatOpen, setChatOpen] = useState(false);
  const [deviceId, setDeviceId] = useState<DeviceProfileId | null>(() => loadDeviceProfile());
  const active = events.filter((event) => ['working', 'researching', 'executing', 'syncing'].includes(event.state)).length;
  const warnings = events.filter((event) => ['error', 'offline', 'stale'].includes(event.state)).length;

  const chooseDevice = (id: DeviceProfileId) => { saveDeviceProfile(id); setDeviceId(id); };
  const interact = (object: ColonyObject) => {
    if (object.kind === 'chat') setChatOpen(true);
    if (object.kind === 'terminal') setView('terminal');
    if (object.kind === 'files') setView('files');
  };

  return (
    <div className="hm-os-game-shell">
      {!deviceId && <DeviceSetup onSelect={chooseDevice} />}
      <div className="hm-os-pixel-office">
        <header className="hm-os-pixel-office-header">
          <div className="hm-os-brand-lockup"><span className="hm-os-brand-gem" aria-hidden="true">H</span><div><span className="hm-os-brand-kicker">LOFI CYBER COLONY</span><h1>HM OS</h1></div></div>
          <div className="hm-os-world-hud" aria-label="콜로니 현황"><span><b>{events.length}</b> ENTITY</span><span><b>{active}</b> ACTIVE</span><span data-warning={warnings > 0}><b>{warnings}</b> ALERT</span><button type="button" className="hm-os-device-switch" onClick={() => { clearDeviceProfile(); setDeviceId(null); }}><b>{deviceId ? 1 : 0}</b> DEVICE 변경</button></div>
          <span className="hm-os-connection-badge" data-connection-state={connectionState}><i />{CONNECTION_LABELS_KO[connectionState] ?? connectionState}</span>
        </header>

        <main className="hm-os-game-screen">
          {view === 'colony' && deviceId && <ColonyMap events={events} deviceId={deviceId} onInteract={interact} />}
          {view === 'terminal' && <TerminalPanel />}
          {view === 'files' && <FileExplorer />}
          {chatOpen && <HermesChat onClose={() => setChatOpen(false)} />}
        </main>

        <nav className="hm-os-main-nav" aria-label="HM OS 기능">
          <button type="button" aria-pressed={view === 'colony'} onClick={() => setView('colony')}><ColonyIcon aria-hidden /><b>콜로니</b><small>GRID</small></button>
          <button type="button" aria-pressed={chatOpen} onClick={() => setChatOpen(true)}><ChatIcon aria-hidden /><b>Hermes</b><small>CHAT</small></button>
          <button type="button" aria-pressed={view === 'terminal'} onClick={() => setView('terminal')}><TerminalIcon aria-hidden /><b>터미널</b><small>CONSOLE</small></button>
          <button type="button" aria-pressed={view === 'files'} onClick={() => setView('files')}><FilesIcon aria-hidden /><b>파일</b><small>ARCHIVE</small></button>
        </nav>
      </div>
    </div>
  );
}
