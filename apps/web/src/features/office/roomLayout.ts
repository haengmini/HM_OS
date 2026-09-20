import type { OfficeConfidence, OfficeSource, OfficeState } from '@hm-os/contracts';

/**
 * Milestone 3: static room layout for the 2D pixel office.
 *
 * The MVP deliberately maps each Milestone 2 data source to exactly
 * one room, 1:1, so there is no ambiguity about where a given
 * OfficeStatusEvent renders. Milestone 4 adds a fifth room
 * ("터미널룸") once the terminal/file WebSocket channels exist; it is
 * defined here already (with no source mapped to it yet) so the grid
 * layout does not reshuffle when that lands.
 */
export interface RoomDefinition {
  id: string;
  title: string;
  koreanSubtitle: string;
  source: OfficeSource | null;
  icon: string;
  accent: string;
}

export const ROOM_DEFINITIONS: readonly RoomDefinition[] = [
  { id: 'control-room', title: 'SYSTEM CORE', koreanSubtitle: '관제실', source: 'system', icon: '◆', accent: '#52d6c8' },
  { id: 'agent-workshop', title: 'AGENT GUILD', koreanSubtitle: '에이전트 길드', source: 'agent-os', icon: '♟', accent: '#ff9f68' },
  { id: 'library', title: 'KNOWLEDGE VAULT', koreanSubtitle: '지식 도서관', source: 'wiki', icon: '▥', accent: '#c4a7ff' },
  { id: 'project-room', title: 'QUEST STUDIO', koreanSubtitle: '프로젝트 공방', source: 'recent-docs', icon: '⚒', accent: '#ffd166' },
  { id: 'terminal-room', title: 'CONTROL GATE', koreanSubtitle: '터미널 게이트', source: null, icon: '>_', accent: '#7dd3fc' },
] as const;

export function roomForSource(source: OfficeSource): RoomDefinition {
  const room = ROOM_DEFINITIONS.find((r) => r.source === source);
  if (!room) {
    throw new Error(`No room mapped for office source: ${source}`);
  }
  return room;
}

/**
 * Visual palette for each OfficeState. Kept as CSS custom-property
 * values (not literal Pixi/canvas colors) so the DOM/CSS pixel-office
 * renderer in Milestone 3 and any future canvas renderer can share
 * this single source of truth.
 */
const STATE_COLORS: Record<OfficeState, string> = {
  idle: '#3b82f6', // blue
  working: '#22c55e', // green
  researching: '#a855f7', // purple
  executing: '#f97316', // orange
  syncing: '#06b6d4', // cyan
  error: '#ef4444', // red
  offline: '#6b7280', // gray
  stale: '#eab308', // yellow
};

export function colorForState(state: OfficeState): string {
  return STATE_COLORS[state];
}

const STATE_LABELS_KO: Record<OfficeState, string> = {
  idle: '대기',
  working: '작업 중',
  researching: '조사 중',
  executing: '실행 중',
  syncing: '동기화 중',
  error: '오류',
  offline: '오프라인',
  stale: '오래됨',
};

export function labelForState(state: OfficeState): string {
  return STATE_LABELS_KO[state];
}

/** Dims a tile's opacity when the underlying data is stale/unknown. */
export function opacityForConfidence(confidence: OfficeConfidence): number {
  switch (confidence) {
    case 'fresh':
      return 1;
    case 'stale':
      return 0.6;
    case 'unknown':
      return 0.35;
    default:
      return 1;
  }
}
