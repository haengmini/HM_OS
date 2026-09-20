import type { OfficeSource } from '@hm-os/contracts';

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 18;

export interface TilePoint { x: number; y: number }
export interface MapRect extends TilePoint { width: number; height: number }
export type InteractionKind = 'chat' | 'terminal' | 'files' | 'system' | 'agents' | 'wiki' | 'projects';

export interface ColonyZone extends MapRect {
  id: string;
  label: string;
  source: OfficeSource | null;
  accent: string;
}

export interface ColonyObject extends MapRect {
  id: string;
  label: string;
  kind: InteractionKind;
  glyph: string;
  solid?: boolean;
}

export const COLONY_ZONES: readonly ColonyZone[] = [
  { id: 'system', label: 'SYSTEM CORE', source: 'system', accent: '#52d6c8', x: 1, y: 1, width: 8, height: 6 },
  { id: 'agents', label: 'AGENT GUILD', source: 'agent-os', accent: '#ff9f68', x: 10, y: 1, width: 12, height: 9 },
  { id: 'wiki', label: 'KNOWLEDGE VAULT', source: 'wiki', accent: '#c4a7ff', x: 23, y: 1, width: 6, height: 9 },
  { id: 'projects', label: 'QUEST STUDIO', source: 'recent-docs', accent: '#ffd166', x: 1, y: 11, width: 12, height: 6 },
  { id: 'control', label: 'CONTROL BAY', source: null, accent: '#7dd3fc', x: 15, y: 11, width: 14, height: 6 },
] as const;

export const COLONY_OBJECTS: readonly ColonyObject[] = [
  { id: 'server-rack', label: '서버 관제', kind: 'system', glyph: '▥', x: 2, y: 2, width: 2, height: 2, solid: true },
  { id: 'system-console', label: '시스템 콘솔', kind: 'system', glyph: '⌁', x: 6, y: 3, width: 2, height: 1, solid: true },
  { id: 'agent-board', label: '에이전트 현황', kind: 'agents', glyph: '♟', x: 11, y: 2, width: 2, height: 1, solid: true },
  { id: 'hermes', label: 'Hermes', kind: 'chat', glyph: 'H', x: 16, y: 5, width: 1, height: 1 },
  { id: 'wiki-shelf', label: '지식 보관소', kind: 'wiki', glyph: '▤', x: 24, y: 2, width: 2, height: 3, solid: true },
  { id: 'wiki-desk', label: '연구 테이블', kind: 'wiki', glyph: '⌕', x: 26, y: 7, width: 2, height: 1, solid: true },
  { id: 'project-board', label: '프로젝트 보드', kind: 'projects', glyph: '◆', x: 2, y: 12, width: 3, height: 1, solid: true },
  { id: 'blueprint', label: '설계 테이블', kind: 'projects', glyph: '⌗', x: 8, y: 14, width: 3, height: 1, solid: true },
  { id: 'terminal', label: '터미널', kind: 'terminal', glyph: '>_', x: 17, y: 12, width: 3, height: 2, solid: true },
  { id: 'files', label: '파일 보관소', kind: 'files', glyph: '▦', x: 24, y: 12, width: 3, height: 2, solid: true },
] as const;

const isInside = (point: TilePoint, rect: MapRect) =>
  point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;

export function isWalkable(point: TilePoint): boolean {
  if (point.x < 0 || point.y < 0 || point.x >= MAP_WIDTH || point.y >= MAP_HEIGHT) return false;
  return !COLONY_OBJECTS.some((object) => object.solid && isInside(point, object));
}

export function distance(a: TilePoint, b: TilePoint) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function nearestInteraction(point: TilePoint): ColonyObject | null {
  let nearest: ColonyObject | null = null;
  let nearestDistance = Infinity;
  for (const object of COLONY_OBJECTS) {
    const target = { x: object.x + Math.floor(object.width / 2), y: object.y + Math.floor(object.height / 2) };
    const d = distance(point, target);
    if (d < nearestDistance && d <= Math.max(2, object.width)) {
      nearest = object;
      nearestDistance = d;
    }
  }
  return nearest;
}

export function findPath(start: TilePoint, goal: TilePoint): TilePoint[] {
  const safeGoal = isWalkable(goal) ? goal : adjacentWalkable(goal)[0];
  if (!safeGoal) return [];
  const key = (point: TilePoint) => `${point.x},${point.y}`;
  const queue: TilePoint[] = [start];
  const previous = new Map<string, TilePoint | null>([[key(start), null]]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current.x === safeGoal.x && current.y === safeGoal.y) {
      const path: TilePoint[] = [];
      let cursor: TilePoint | null = current;
      while (cursor && key(cursor) !== key(start)) {
        path.unshift(cursor);
        cursor = previous.get(key(cursor)) ?? null;
      }
      return path;
    }
    for (const next of adjacentWalkable(current)) {
      if (!previous.has(key(next))) {
        previous.set(key(next), current);
        queue.push(next);
      }
    }
  }
  return [];
}

function adjacentWalkable(point: TilePoint) {
  return [
    { x: point.x + 1, y: point.y }, { x: point.x - 1, y: point.y },
    { x: point.x, y: point.y + 1 }, { x: point.x, y: point.y - 1 },
  ].filter(isWalkable);
}

export function spawnForSource(source: OfficeSource, index: number): TilePoint {
  const zone = COLONY_ZONES.find((candidate) => candidate.source === source) ?? COLONY_ZONES[1]!;
  const columns = Math.max(1, zone.width - 2);
  return {
    x: zone.x + 1 + (index % columns),
    y: zone.y + 2 + (Math.floor(index / columns) % Math.max(1, zone.height - 3)),
  };
}
