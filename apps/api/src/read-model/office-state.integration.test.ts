import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectOfficeStatusEvents } from './office-state.js';

describe('collectOfficeStatusEvents (integration)', () => {
  let profilesDir: string | undefined;
  let kanbanDir: string | undefined;
  let wikiRoot: string | undefined;
  let recentRoot: string | undefined;

  afterEach(async () => {
    for (const dir of [profilesDir, kanbanDir, wikiRoot, recentRoot]) {
      if (dir) await rm(dir, { recursive: true, force: true });
    }
    profilesDir = kanbanDir = wikiRoot = recentRoot = undefined;
  });

  it('aggregates all four sources into one event list, tolerating missing dirs', async () => {
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-int-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-int-kanban-'));
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-int-wiki-'));
    recentRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-int-recent-'));

    await mkdir(path.join(profilesDir, 'coder'), { recursive: true });
    await writeFile(path.join(profilesDir, 'coder', 'SOUL.md'), '# Coder');
    await writeFile(path.join(wikiRoot, 'index.md'), '# Index');
    await writeFile(path.join(recentRoot, 'notes.txt'), 'hello');

    const events = await collectOfficeStatusEvents({
      profilesDir,
      kanbanBoardsDir: kanbanDir,
      wikiRoot,
      recentDocRoots: [recentRoot],
      staleAfterMs: 5 * 60 * 1000,
    });

    const sources = events.map((e) => e.source).sort();
    expect(sources).toEqual(['agent-os', 'recent-docs', 'system', 'wiki']);
  });

  it('still returns system/other events when profilesDir does not exist', async () => {
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-int-wiki-'));
    recentRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-int-recent-'));

    const events = await collectOfficeStatusEvents({
      profilesDir: '/nonexistent/hm-os-profiles',
      kanbanBoardsDir: '/nonexistent/hm-os-kanban',
      wikiRoot,
      recentDocRoots: [recentRoot],
      staleAfterMs: 5 * 60 * 1000,
    });

    const sources = events.map((e) => e.source);
    expect(sources).toContain('system');
    // agent-os adapter returns an empty array (no profiles found), not
    // a thrown error, so it contributes zero events here — that is
    // the expected degrade-gracefully behavior, not a crash.
  });
});
