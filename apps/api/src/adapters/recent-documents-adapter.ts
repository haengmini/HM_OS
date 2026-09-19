import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { OfficeStatusEvent } from '@hm-os/contracts';

const SKIP_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.hermes',
  'coverage',
]);

export interface RecentDocument {
  root: string;
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
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, maxDepth, depth + 1)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Scans the configured project roots for the most recently modified
 * files. Each root is walked independently so one unreadable/huge
 * project directory does not block the others.
 */
export async function readRecentDocuments(
  roots: string[],
  limit = 15,
  maxDepth = 3,
): Promise<RecentDocument[]> {
  const all: RecentDocument[] = [];

  for (const root of roots) {
    const files = await walk(root, maxDepth);
    for (const file of files) {
      try {
        const s = await stat(file);
        all.push({
          root,
          relativePath: path.relative(root, file),
          absolutePath: file,
          mtimeMs: s.mtimeMs,
        });
      } catch {
        continue;
      }
    }
  }

  return all.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, limit);
}

export function toOfficeStatusEvent(
  docs: RecentDocument[],
  staleAfterMs: number,
  observedAt = new Date(),
): OfficeStatusEvent {
  if (docs.length === 0) {
    return {
      source: 'recent-docs',
      entityId: 'recent-documents',
      state: 'offline',
      detail: 'No recent documents found',
      observedAt: observedAt.toISOString(),
      confidence: 'unknown',
    };
  }

  const newest = docs[0]!;
  const ageMs = observedAt.getTime() - newest.mtimeMs;
  const stale = ageMs > staleAfterMs;

  return {
    source: 'recent-docs',
    entityId: 'recent-documents',
    state: stale ? 'stale' : 'working',
    detail: `${docs.length} recent files; latest: ${newest.relativePath}`,
    sourcePath: newest.absolutePath,
    observedAt: observedAt.toISOString(),
    confidence: stale ? 'stale' : 'fresh',
  };
}
