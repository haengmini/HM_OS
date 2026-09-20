import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { DevicePresence, DeviceProfileId, OfficeStatusEvent } from '@hm-os/contracts';
import {
  COLONY_OBJECTS, COLONY_ZONES, MAP_HEIGHT, MAP_WIDTH, findPath, isWalkable,
  nearestInteraction, spawnForSource, type ColonyObject, type TilePoint,
} from './colonyMap.js';
import { useDevicePresence } from './useDevicePresence.js';

interface ColonyMapProps {
  events: OfficeStatusEvent[];
  deviceId: DeviceProfileId;
  onInteract: (object: ColonyObject) => void;
}

type Facing = DevicePresence['facing'];
const START: TilePoint = { x: 14, y: 9 };
const positionStyle = (point: TilePoint) => ({ left: `${point.x / MAP_WIDTH * 100}%`, top: `${point.y / MAP_HEIGHT * 100}%` });

export function ColonyMap({ events, deviceId, onInteract }: ColonyMapProps) {
  const [position, setPosition] = useState<TilePoint>(START);
  const [facing, setFacing] = useState<Facing>('down');
  const [walking, setWalking] = useState(false);
  const pathRef = useRef<TilePoint[]>([]);
  const devices = useDevicePresence(deviceId, position, facing);
  const interaction = nearestInteraction(position);

  const move = useCallback((dx: number, dy: number) => {
    pathRef.current = [];
    setPosition((current) => {
      const next = { x: current.x + dx, y: current.y + dy };
      return isWalkable(next) ? next : current;
    });
    setFacing(dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
    setWalking(true);
    window.setTimeout(() => setWalking(false), 180);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const direction: Record<string, [number, number]> = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      };
      const selected = direction[event.key];
      if (selected) { event.preventDefault(); move(selected[0], selected[1]); }
      if ((event.key === 'e' || event.key === 'E' || event.key === 'Enter') && interaction) onInteract(interaction);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interaction, move, onInteract]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = pathRef.current.shift();
      if (!next) { setWalking(false); return; }
      setPosition((current) => {
        setFacing(next.x < current.x ? 'left' : next.x > current.x ? 'right' : next.y < current.y ? 'up' : 'down');
        return next;
      });
      setWalking(true);
    }, 130);
    return () => window.clearInterval(timer);
  }, []);

  const clickMap = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button,[data-map-object]')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const goal = {
      x: Math.min(MAP_WIDTH - 1, Math.max(0, Math.floor((event.clientX - rect.left) / rect.width * MAP_WIDTH))),
      y: Math.min(MAP_HEIGHT - 1, Math.max(0, Math.floor((event.clientY - rect.top) / rect.height * MAP_HEIGHT))),
    };
    pathRef.current = findPath(position, goal);
  };

  const npcEvents = useMemo(() => {
    const sourceCounts = new Map<string, number>();
    return events.map((event) => {
      const index = sourceCounts.get(event.source) ?? 0;
      sourceCounts.set(event.source, index + 1);
      return { event, point: spawnForSource(event.source, index) };
    });
  }, [events]);

  return (
    <section className="hm-os-colony-wrap" aria-label="HM OS 콜로니 맵">
      <div className="hm-os-colony-map" onClick={clickMap} role="application" aria-label="WASD, 방향키 또는 클릭으로 이동">
        <div className="hm-os-colony-ground" aria-hidden="true" />
        {COLONY_ZONES.map((zone) => (
          <div key={zone.id} className={`hm-os-colony-zone zone-${zone.id}`} style={{
            left: `${zone.x / MAP_WIDTH * 100}%`, top: `${zone.y / MAP_HEIGHT * 100}%`,
            width: `${zone.width / MAP_WIDTH * 100}%`, height: `${zone.height / MAP_HEIGHT * 100}%`,
            '--zone-accent': zone.accent,
          } as CSSProperties}><span>{zone.label}</span></div>
        ))}
        <div className="hm-os-colony-road road-horizontal" aria-hidden="true" />
        <div className="hm-os-colony-road road-vertical" aria-hidden="true" />

        {COLONY_OBJECTS.map((object) => (
          <button key={object.id} type="button" data-map-object={object.kind} className={`hm-os-map-object object-${object.kind}`} style={{
            ...positionStyle(object), width: `${object.width / MAP_WIDTH * 100}%`, height: `${object.height / MAP_HEIGHT * 100}%`,
          }} onClick={(event) => { event.stopPropagation(); onInteract(object); }} title={`${object.label} — 가까이에서 E`}>
            <span>{object.glyph}</span><small>{object.label}</small>
          </button>
        ))}

        {npcEvents.map(({ event, point }, index) => (
          <div key={`${event.source}:${event.entityId}`} className="hm-os-colony-npc" data-state={event.state} style={{ ...positionStyle(point), '--npc-delay': `${index * -.3}s` } as CSSProperties} title={event.detail ?? event.entityId}>
            <i className="npc-shadow" /><span className="npc-body"><b /><i /></span><small>{event.entityId}</small>
          </div>
        ))}

        {devices.filter((device) => device.deviceId !== deviceId && device.online).map((device) => (
          <DeviceCharacter key={device.deviceId} device={device} />
        ))}
        <DeviceCharacter device={{ deviceId, label: deviceId, platform: deviceId === 'iphone' ? 'ios' : deviceId.includes('linux') ? 'linux' : 'windows', ...position, facing, lastSeenAt: '', online: true }} current walking={walking} />
      </div>

      {interaction && <button className="hm-os-interaction-prompt" type="button" onClick={() => onInteract(interaction)}><kbd>E</kbd><span>{interaction.label}</span></button>}
      <div className="hm-os-mobile-controls" aria-label="이동 조작">
        <button onClick={() => move(0, -1)} aria-label="위로">▲</button>
        <button onClick={() => move(-1, 0)} aria-label="왼쪽">◀</button>
        <button onClick={() => move(1, 0)} aria-label="오른쪽">▶</button>
        <button onClick={() => move(0, 1)} aria-label="아래로">▼</button>
        <button className="action" disabled={!interaction} onClick={() => interaction && onInteract(interaction)}>E</button>
      </div>
    </section>
  );
}

function DeviceCharacter({ device, current = false, walking = false }: { device: DevicePresence; current?: boolean; walking?: boolean }) {
  return (
    <div className={`hm-os-device-character device-${device.deviceId}`} data-current={current} data-facing={device.facing} data-walking={walking} style={positionStyle(device)} title={device.label}>
      {current && <em>YOU</em>}<i className="device-shadow" /><span className="device-body"><b /><i /><u /></span><small>{device.label}</small>
    </div>
  );
}
