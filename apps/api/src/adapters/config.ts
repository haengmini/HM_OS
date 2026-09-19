/**
 * Milestone 2 environment inputs for read-model adapters.
 * All paths point at REAL existing sources on this server (verified
 * during Milestone 2 reconnaissance), overridable for tests.
 */
export interface AdapterConfig {
  /** Agent OS profile roots, e.g. /opt/data/profiles/<name>/SOUL.md */
  profilesDir: string;
  /** Kanban SQLite DBs, e.g. /opt/data/kanban/boards/<board>/kanban.db */
  kanbanBoardsDir: string;
  /** Local Second Brain / Wiki root, e.g. /opt/data/second-brain */
  wikiRoot: string;
  /** Roots to scan for "recent documents" (project trees). */
  recentDocRoots: string[];
  /** Max age (ms) before a successful read is still reported as stale. */
  staleAfterMs: number;
}

function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(':').filter(Boolean);
}

export function loadAdapterConfig(): AdapterConfig {
  return {
    profilesDir: process.env.HM_OS_PROFILES_DIR ?? '/opt/data/profiles',
    kanbanBoardsDir: process.env.HM_OS_KANBAN_DIR ?? '/opt/data/kanban/boards',
    wikiRoot: process.env.HM_OS_WIKI_ROOT ?? '/opt/data/second-brain',
    recentDocRoots: envList('HM_OS_RECENT_DOC_ROOTS', ['/opt/data/projects']),
    staleAfterMs: Number(process.env.HM_OS_STALE_AFTER_MS ?? 5 * 60 * 1000),
  };
}
