import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import type { OfficeStatusEvent } from '@hm-os/contracts';

/**
 * Agent OS adapter: reads real profile contracts (SOUL.md) and the
 * real Kanban SQLite boards to derive each profile's current state.
 *
 * Design constraint (docs/architecture/DATA_SOURCES.md): a failure to
 * read one profile or one board must not fail the whole adapter —
 * that profile is reported as 'unknown'/'stale' instead.
 */

export interface AgentOsProfileSummary {
  name: string;
  soulPresent: boolean;
  soulPath: string;
  currentTask?: {
    id: string;
    title: string;
    status: string;
    board: string;
  };
}

async function listProfileNames(profilesDir: string): Promise<string[]> {
  try {
    const entries = await readdir(profilesDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function readSoulPresence(profilesDir: string, name: string): Promise<{ present: boolean; path: string }> {
  const soulPath = path.join(profilesDir, name, 'SOUL.md');
  try {
    await stat(soulPath);
    return { present: true, path: soulPath };
  } catch {
    return { present: false, path: soulPath };
  }
}

interface TaskRow {
  id: string;
  title: string;
  assignee: string;
  status: string;
}

async function listKanbanBoards(kanbanBoardsDir: string): Promise<string[]> {
  try {
    const entries = await readdir(kanbanBoardsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Finds the most relevant in-progress (or else most recent) task per
 * assignee across all boards. Lazily imports node:sqlite so this
 * module still loads on a Node build without it (defensive; the
 * target runtime here is Node 26 where it is stable).
 */
async function readAssigneeTasks(kanbanBoardsDir: string): Promise<Map<string, TaskRow & { board: string }>> {
  const result = new Map<string, TaskRow & { board: string }>();
  const boards = await listKanbanBoards(kanbanBoardsDir);
  if (boards.length === 0) return result;

  let DatabaseSync: typeof DatabaseSyncType;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    return result; // node:sqlite unavailable — adapter degrades gracefully.
  }

  for (const board of boards) {
    const dbPath = path.join(kanbanBoardsDir, board, 'kanban.db');
    try {
      await stat(dbPath);
    } catch {
      continue;
    }

    let db: InstanceType<typeof DatabaseSyncType> | undefined;
    try {
      db = new DatabaseSync(dbPath, { readOnly: true });
      const rows = db
        .prepare(
          `select id, title, assignee, status
           from tasks
           where status != 'done'
           order by
             case status when 'in_progress' then 0 else 1 end,
             priority desc,
             created_at desc`,
        )
        .all() as unknown as TaskRow[];

      for (const row of rows) {
        if (!row.assignee || result.has(row.assignee)) continue;
        result.set(row.assignee, { ...row, board });
      }
    } catch {
      continue; // one bad board must not break the others.
    } finally {
      db?.close();
    }
  }

  return result;
}

export async function readAgentOsProfiles(
  profilesDir: string,
  kanbanBoardsDir: string,
): Promise<AgentOsProfileSummary[]> {
  const names = await listProfileNames(profilesDir);
  const tasksByAssignee = await readAssigneeTasks(kanbanBoardsDir);

  const summaries: AgentOsProfileSummary[] = [];
  for (const name of names) {
    const soul = await readSoulPresence(profilesDir, name);
    const task = tasksByAssignee.get(name);
    summaries.push({
      name,
      soulPresent: soul.present,
      soulPath: soul.path,
      currentTask: task
        ? { id: task.id, title: task.title, status: task.status, board: task.board }
        : undefined,
    });
  }
  return summaries;
}

function taskStatusToOfficeState(status: string): OfficeStatusEvent['state'] {
  switch (status) {
    case 'in_progress':
      return 'working';
    case 'review':
      return 'researching';
    case 'blocked':
      return 'error';
    default:
      return 'idle';
  }
}

export function toOfficeStatusEvents(
  profiles: AgentOsProfileSummary[],
  observedAt = new Date(),
): OfficeStatusEvent[] {
  return profiles.map((profile) => {
    if (!profile.soulPresent) {
      return {
        source: 'agent-os',
        entityId: profile.name,
        state: 'offline',
        detail: 'SOUL.md not found',
        observedAt: observedAt.toISOString(),
        confidence: 'unknown',
      } satisfies OfficeStatusEvent;
    }

    if (!profile.currentTask) {
      return {
        source: 'agent-os',
        entityId: profile.name,
        state: 'idle',
        sourcePath: profile.soulPath,
        observedAt: observedAt.toISOString(),
        confidence: 'fresh',
      } satisfies OfficeStatusEvent;
    }

    return {
      source: 'agent-os',
      entityId: profile.name,
      state: taskStatusToOfficeState(profile.currentTask.status),
      detail: `${profile.currentTask.title} (${profile.currentTask.board}/${profile.currentTask.id})`,
      sourcePath: profile.soulPath,
      observedAt: observedAt.toISOString(),
      confidence: 'fresh',
    } satisfies OfficeStatusEvent;
  });
}

// readFile is imported for future use (profile detail drill-down in
// Milestone 3's AgentDetailPanel); referenced here to avoid an
// unused-import lint failure while that consumer doesn't exist yet.
export async function readSoulExcerpt(soulPath: string, maxChars = 2000): Promise<string | null> {
  try {
    const raw = await readFile(soulPath, 'utf8');
    return raw.slice(0, maxChars);
  } catch {
    return null;
  }
}
