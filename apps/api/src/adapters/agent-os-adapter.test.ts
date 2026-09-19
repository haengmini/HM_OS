import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readAgentOsProfiles, toOfficeStatusEvents } from './agent-os-adapter.js';

async function createKanbanBoard(boardsDir: string, boardName: string, tasks: Array<{ id: string; title: string; assignee: string; status: string; priority?: number }>) {
  const { DatabaseSync } = await import('node:sqlite');
  const boardDir = path.join(boardsDir, boardName);
  await mkdir(boardDir, { recursive: true });
  const db = new DatabaseSync(path.join(boardDir, 'kanban.db'));
  db.exec(`
    create table tasks (
      id text primary key,
      title text,
      assignee text,
      status text,
      priority integer default 0,
      created_at integer default 0
    )
  `);
  const insert = db.prepare(
    'insert into tasks (id, title, assignee, status, priority, created_at) values (?, ?, ?, ?, ?, ?)',
  );
  let createdAt = 0;
  for (const t of tasks) {
    insert.run(t.id, t.title, t.assignee, t.status, t.priority ?? 0, createdAt++);
  }
  db.close();
}

describe('agent-os-adapter', () => {
  let profilesDir: string | undefined;
  let kanbanDir: string | undefined;

  afterEach(async () => {
    if (profilesDir) await rm(profilesDir, { recursive: true, force: true });
    if (kanbanDir) await rm(kanbanDir, { recursive: true, force: true });
    profilesDir = undefined;
    kanbanDir = undefined;
  });

  it('reports a profile with no SOUL.md as offline/unknown', async () => {
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-kanban-'));
    await mkdir(path.join(profilesDir, 'ghost'), { recursive: true });
    // No SOUL.md written.

    const profiles = await readAgentOsProfiles(profilesDir, kanbanDir);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]!.soulPresent).toBe(false);

    const events = toOfficeStatusEvents(profiles, new Date('2026-01-01T00:00:00.000Z'));
    expect(events[0]!.state).toBe('offline');
    expect(events[0]!.confidence).toBe('unknown');
  });

  it('reports idle for a profile with SOUL.md but no open task', async () => {
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-kanban-'));
    await mkdir(path.join(profilesDir, 'coder'), { recursive: true });
    await writeFile(path.join(profilesDir, 'coder', 'SOUL.md'), '# Coder contract');

    const profiles = await readAgentOsProfiles(profilesDir, kanbanDir);
    expect(profiles[0]!.soulPresent).toBe(true);
    expect(profiles[0]!.currentTask).toBeUndefined();

    const events = toOfficeStatusEvents(profiles, new Date('2026-01-01T00:00:00.000Z'));
    expect(events[0]!.state).toBe('idle');
    expect(events[0]!.sourcePath).toContain('SOUL.md');
  });

  it('reports working for a profile with an in_progress kanban task', async () => {
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-kanban-'));
    await mkdir(path.join(profilesDir, 'coder'), { recursive: true });
    await writeFile(path.join(profilesDir, 'coder', 'SOUL.md'), '# Coder contract');
    await createKanbanBoard(kanbanDir, 'hm-os', [
      { id: 't_1', title: 'Implement terminal panel', assignee: 'coder', status: 'in_progress' },
      { id: 't_2', title: 'Old done task', assignee: 'coder', status: 'done' },
    ]);

    const profiles = await readAgentOsProfiles(profilesDir, kanbanDir);
    expect(profiles[0]!.currentTask?.title).toBe('Implement terminal panel');

    const events = toOfficeStatusEvents(profiles, new Date('2026-01-01T00:00:00.000Z'));
    expect(events[0]!.state).toBe('working');
    expect(events[0]!.detail).toContain('Implement terminal panel');
  });

  it('does not fail the whole adapter when one board is corrupt', async () => {
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-kanban-'));
    await mkdir(path.join(profilesDir, 'coder'), { recursive: true });
    await writeFile(path.join(profilesDir, 'coder', 'SOUL.md'), '# Coder contract');

    // Corrupt board: a directory with a non-sqlite file named kanban.db
    await mkdir(path.join(kanbanDir, 'broken-board'), { recursive: true });
    await writeFile(path.join(kanbanDir, 'broken-board', 'kanban.db'), 'not a real sqlite file');

    await createKanbanBoard(kanbanDir, 'good-board', [
      { id: 't_1', title: 'Still works', assignee: 'coder', status: 'in_progress' },
    ]);

    const profiles = await readAgentOsProfiles(profilesDir, kanbanDir);
    expect(profiles[0]!.currentTask?.title).toBe('Still works');
  });
});
