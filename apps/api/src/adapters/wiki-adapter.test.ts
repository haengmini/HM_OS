import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readRecentWikiNotes, toOfficeStatusEvent } from './wiki-adapter.js';

describe('wiki-adapter', () => {
  let wikiRoot: string | undefined;

  afterEach(async () => {
    if (wikiRoot) await rm(wikiRoot, { recursive: true, force: true });
    wikiRoot = undefined;
  });

  it('finds markdown notes and skips .obsidian/graphify-out directories', async () => {
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-wiki-'));
    await mkdir(path.join(wikiRoot, '.obsidian'), { recursive: true });
    await writeFile(path.join(wikiRoot, '.obsidian', 'workspace.json'), '{}');
    await mkdir(path.join(wikiRoot, 'graphify-out'), { recursive: true });
    await writeFile(path.join(wikiRoot, 'graphify-out', 'graph.json'), '{}');
    await mkdir(path.join(wikiRoot, '30-knowledge'), { recursive: true });
    await writeFile(path.join(wikiRoot, '30-knowledge', 'note-a.md'), '# A');
    await writeFile(path.join(wikiRoot, 'index.md'), '# Index');

    const notes = await readRecentWikiNotes(wikiRoot);
    const relPaths = notes.map((n) => n.relativePath);
    expect(relPaths).toContain('index.md');
    expect(relPaths).toContain(path.join('30-knowledge', 'note-a.md'));
    expect(relPaths.some((p) => p.includes('.obsidian'))).toBe(false);
    expect(relPaths.some((p) => p.includes('graphify-out'))).toBe(false);
  });

  it('reports offline when the wiki root has no notes', async () => {
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-wiki-empty-'));
    const notes = await readRecentWikiNotes(wikiRoot);
    const event = toOfficeStatusEvent(notes, 5 * 60 * 1000, new Date('2026-01-01T00:00:00.000Z'));
    expect(event.state).toBe('offline');
  });

  it('reports stale when the newest note is older than staleAfterMs', async () => {
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-wiki-stale-'));
    const filePath = path.join(wikiRoot, 'old-note.md');
    await writeFile(filePath, '# Old');
    const oldTime = new Date('2020-01-01T00:00:00.000Z');
    await utimes(filePath, oldTime, oldTime);

    const notes = await readRecentWikiNotes(wikiRoot);
    const event = toOfficeStatusEvent(notes, 5 * 60 * 1000, new Date('2026-01-01T00:00:00.000Z'));
    expect(event.state).toBe('stale');
    expect(event.confidence).toBe('stale');
  });
});
