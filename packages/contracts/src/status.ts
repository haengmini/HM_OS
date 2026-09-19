/**
 * Shared status/read-model contracts between apps/api and apps/web.
 * Implemented in Milestone 2; kept minimal in Milestone 0 so both
 * workspaces can typecheck against a stable shape from day one.
 */

export type OfficeSource = 'system' | 'agent-os' | 'wiki' | 'recent-docs';

export type OfficeState =
  | 'idle'
  | 'working'
  | 'researching'
  | 'executing'
  | 'syncing'
  | 'error'
  | 'offline'
  | 'stale';

export type OfficeConfidence = 'fresh' | 'stale' | 'unknown';

export interface OfficeStatusEvent {
  source: OfficeSource;
  entityId: string;
  state: OfficeState;
  detail?: string;
  sourcePath?: string;
  observedAt: string;
  confidence: OfficeConfidence;
}
