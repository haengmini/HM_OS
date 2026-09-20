import type { OfficeSource } from '@hm-os/contracts';

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 18;

export interface TilePoint { x: number; y: number }
export interface MapRect extends TilePoint { width: number; height: number }
export type InteractionKind = 'chat' | 'terminal' | 'files' | 'system' | 'agents' | 'wiki' | 'projects';

export interface ColonyZone extends MapRect {
  id: string;
  label: string;
  koreanLabel: string;
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

export interface Decoration extends TilePoint {
  id: string;
  glyph: string;
  solid: boolean;
}

/** A single-tile river cuts through the island; only the bridge tiles are crossable. */
export const RIVER_X = 21;
export const BRIDGE_Y_RANGE: readonly [number, number] = [8, 10];

export const COLONY_ZONES: readonly ColonyZone[] = [
  { id: 'system', label: 'TOWN HALL', koreanLabel: '타운홀', source: 'system', accent: '#7fc79a', x: 1, y: 1, width: 8, height: 6 },
  { id: 'agents', label: 'RESIDENT SERVICES', koreanLabel: '레지던트 서비스', source: 'agent-os', accent: '#f3b26a', x: 10, y: 1, width: 12, height: 9 },
  { id: 'wiki', label: 'MUSEUM', koreanLabel: '박물관', source: 'wiki', accent: '#c9a6e8', x: 23, y: 1, width: 6, height: 9 },
  { id: 'projects', label: "NOOK'S CRANNY", koreanLabel: '너굴상점', source: 'recent-docs', accent: '#ffcf6b', x: 1, y: 11, width: 12, height: 6 },
  { id: 'control', label: 'AIRPORT', koreanLabel: '공항', source: null, accent: '#7ec8e3', x: 15, y: 11, width: 14, height: 6 },
] as const;

export const COLONY_OBJECTS: readonly ColonyObject[] = [
  { id: 'server-rack', label: '타운홀 안내데스크', kind: 'system', glyph: '🏛️', x: 2, y: 2, width: 2, height: 2, solid: true },
  { id: 'system-console', label: '마을 게시판', kind: 'system', glyph: '📋', x: 6, y: 3, width: 2, height: 1, solid: true },
  { id: 'agent-board', label: '레지던트 서비스 창구', kind: 'agents', glyph: '🦝', x: 11, y: 2, width: 2, height: 1, solid: true },
  { id: 'hermes', label: 'Hermes', kind: 'chat', glyph: '🦊', x: 16, y: 5, width: 1, height: 1 },
  { id: 'wiki-shelf', label: '박물관 전시실', kind: 'wiki', glyph: '🖼️', x: 24, y: 2, width: 2, height: 3, solid: true },
  { id: 'wiki-desk', label: '큐레이터 데스크', kind: 'wiki', glyph: '📖', x: 26, y: 7, width: 2, height: 1, solid: true },
  { id: 'project-board', label: '너굴상점 간판', kind: 'projects', glyph: '🛍️', x: 2, y: 12, width: 3, height: 1, solid: true },
  { id: 'blueprint', label: '공작 테이블', kind: 'projects', glyph: '🔨', x: 8, y: 14, width: 3, height: 1, solid: true },
  { id: 'terminal', label: '공항 탑승구', kind: 'terminal', glyph: '✈️', x: 17, y: 12, width: 3, height: 2, solid: true },
  { id: 'files', label: '화물 창고', kind: 'files', glyph: '📦', x: 24, y: 12, width: 3, height: 2, solid: true },
] as const;

const TREE_XS = [0, 4, 8, 12, 16, 20, 24, 28];
export const DECORATIONS: readonly Decoration[] = [
  ...TREE_XS.map((x) => ({ id: `tree-top-${x}`, x, y: 0, glyph: '🌳', solid: true })),
  ...TREE_XS.map((x) => ({ id: `tree-bottom-${x}`, x, y: 17, glyph: '🌳', solid: true })),
  { id: 'flower-1', x: 4, y: 8, glyph: '🌷', solid: false },
  { id: 'flower-2', x: 9, y: 5, glyph: '🌼', solid: false },
  { id: 'flower-3', x: 18, y: 3, glyph: '🌷', solid: false },
  { id: 'flower-4', x: 29, y: 4, glyph: '🌼', solid: false },
  { id: 'bush-1', x: 6, y: 17 - 4, glyph: '🌿', solid: false },
  { id: 'bush-2', x: 22, y: 15, glyph: '🌿', solid: false },
] as const;

const isInside = (point: TilePoint, rect: MapRect) =>
  point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;

function isRiver(point: TilePoint): boolean {
  if (point.x !== RIVER_X) return false;
  return point.y < BRIDGE_Y_RANGE[0] || point.y > BRIDGE_Y_RANGE[1];
}

export function isWalkable(point: TilePoint): boolean {
  if (point.x < 0 || point.y < 0 || point.x >= MAP_WIDTH || point.y >= MAP_HEIGHT) return false;
  if (isRiver(point)) return false;
  if (COLONY_OBJECTS.some((object) => object.solid && isInside(point, object))) return false;
  if (DECORATIONS.some((deco) => deco.solid && deco.x === point.x && deco.y === point.y)) return false;
  return true;
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
