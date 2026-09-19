import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readRecentDocuments, toOfficeStatusEvent } from './recent-documents-adapter.js';

describe('recent-documents-adapter', () => {
  let root: string | undefined;

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
    root = undefined;
  });

  it('finds files across multiple project roots and skips node_modules', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-docs-'));
    const projectA = path.join(root, 'project-a');
    await mkdir(path.join(projectA, 'node_modules', 'some-pkg'), { recursive: true });
    await writeFile(path.join(projectA, 'node_modules', 'some-pkg', 'index.js'), '// dep');
    await writeFile(path.join(projectA, 'README.md'), '# A');

    const docs = await readRecentDocuments([projectA]);
    const relPaths = docs.map((d) => d.relativePath);
    expect(relPaths).toContain('README.md');
    expect(relPaths.some((p) => p.includes('node_modules'))).toBe(false);
  });

  it('reports offline when no roots have any files', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-docs-empty-'));
    const docs = await readRecentDocuments([path.join(root, 'nonexistent')]);
    const event = toOfficeStatusEvent(docs, 5 * 60 * 1000, new Date('2026-01-01T00:00:00.000Z'));
    expect(event.state).toBe('offline');
  });

  it('does not fail when one root is unreadable', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-docs-mixed-'));
    const goodRoot = path.join(root, 'good');
    await mkdir(goodRoot, { recursive: true });
    await writeFile(path.join(goodRoot, 'file.txt'), 'hello');

    const docs = await readRecentDocuments([path.join(root, 'missing'), goodRoot]);
    expect(docs.some((d) => d.relativePath === 'file.txt')).toBe(true);
  });
});
