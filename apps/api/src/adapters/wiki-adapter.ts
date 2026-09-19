import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { OfficeStatusEvent } from '@hm-os/contracts';

/**
 * Wiki/Obsidian adapter over the real local Second Brain
 * (/opt/data/second-brain by default). Walks a bounded set of
 * top-level content directories and returns the most recently
 * modified markdown files, skipping hidden/system dirs so this stays
 * cheap on a large vault.
 */

const SKIP_DIR_NAMES = new Set(['.obsidian', '.git', '.index', 'graphify-out', 'node_modules']);

export interface WikiRecentNote {
  relativePath: string;
  absolutePath: string;
  mtimeMs: number;
}

async function walk(dir: string, maxDepth: number, depth = 0): Promise<string[]> {
  if (depth > maxDepth) return [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') && !entry.isFile()) continue;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, maxDepth, depth + 1)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

export async function readRecentWikiNotes(
  wikiRoot: string,
  limit = 10,
  maxDepth = 4,
): Promise<WikiRecentNote[]> {
  const files = await walk(wikiRoot, maxDepth);
  const withStats: WikiRecentNote[] = [];

  for (const file of files) {
    try {
      const s = await stat(file);
      withStats.push({
        relativePath: path.relative(wikiRoot, file),
        absolutePath: file,
        mtimeMs: s.mtimeMs,
      });
    } catch {
      continue; // file disappeared between listing and stat — skip it.
    }
  }

  return withStats.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, limit);
}

export function toOfficeStatusEvent(
  notes: WikiRecentNote[],
  staleAfterMs: number,
  observedAt = new Date(),
): OfficeStatusEvent {
  if (notes.length === 0) {
    return {
      source: 'wiki',
      entityId: 'second-brain',
      state: 'offline',
      detail: 'No notes found',
      observedAt: observedAt.toISOString(),
      confidence: 'unknown',
    };
  }

  const newest = notes[0]!;
  const ageMs = observedAt.getTime() - newest.mtimeMs;
  const stale = ageMs > staleAfterMs;

  return {
    source: 'wiki',
    entityId: 'second-brain',
    state: stale ? 'stale' : 'idle',
    detail: `${notes.length} recent notes; latest: ${newest.relativePath}`,
    sourcePath: newest.absolutePath,
    observedAt: observedAt.toISOString(),
    confidence: stale ? 'stale' : 'fresh',
  };
}
