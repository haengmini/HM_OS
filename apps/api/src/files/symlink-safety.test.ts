import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { lstat, mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { FileService } from './file-service.js';
import { PathEscapeError, resolveSafeFilePath } from './path-safety.js';

// Only synthetic fixtures: never inspect host/user files.
describe('FileService symlink boundary', () => {
  let fixture: string;
  let root: string;
  let outside: string;
  let service: FileService;
  beforeEach(async () => {
    fixture = await mkdtemp(path.join(tmpdir(), 'hm-os-symlink-'));
    root = path.join(fixture, 'root');
    outside = path.join(fixture, 'root-sibling');
    await mkdir(root);
    await mkdir(outside);
    await writeFile(path.join(outside, 'sentinel'), 'outside fixture');
    await symlink(outside, path.join(root, 'escape'));
    await symlink(path.join(outside, 'sentinel'), path.join(root, 'escape-file'));
    await symlink(path.join(outside, 'missing'), path.join(root, 'dangling'));
    service = new FileService(root);
  });
  afterEach(async () => { await rm(fixture, { recursive: true, force: true }); });

  it.each(['read', 'download', 'list', 'write', 'upload', 'mkdir', 'move-source', 'move-target', 'delete', 'dangling-write'])('blocks %s through external symlinks', async (operation) => {
    await service.write('local', 'local fixture');
    const actions: Record<string, () => Promise<unknown>> = {
      read: () => service.read('escape-file'),
      download: () => service.readRaw('escape/sentinel'),
      list: () => service.list('escape'),
      write: () => service.write('escape/new', 'bad'),
      upload: () => service.writeRaw('escape-file', Buffer.from('bad')),
      mkdir: () => service.mkdir('escape/new-dir'),
      'move-source': () => service.move('escape/sentinel', 'stolen'),
      'move-target': () => service.move('local', 'escape/new'),
      delete: () => service.delete('escape/sentinel'),
      'dangling-write': () => service.write('dangling', 'bad'),
    };
    await expect(actions[operation]!()).rejects.toMatchObject({ reason: 'path_escape' });
    expect(await readFile(path.join(outside, 'sentinel'), 'utf8')).toBe('outside fixture');
    await expect(lstat(path.join(outside, 'new'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('resolves physical paths with nonexistent tails without requiring target creation', async () => {
    await expect(resolveSafeFilePath(root, 'escape/missing/child')).rejects.toBeInstanceOf(PathEscapeError);
    await expect(resolveSafeFilePath(root, 'dangling')).rejects.toBeInstanceOf(PathEscapeError);
    expect(await resolveSafeFilePath(root, 'missing/child')).toEqual({
      absolutePath: path.join(root, 'missing/child'), relativePath: 'missing/child',
    });
  });

  it('omits external symlinks from list without exposing target metadata', async () => {
    expect((await service.list('.')).entries).toEqual([]);
  });

  it('checks missing tails, chained links and legitimate dot-dot names', async () => {
    await symlink('escape', path.join(root, 'chain'));
    await expect(service.write('chain/missing/child', 'x')).rejects.toMatchObject({ reason: 'path_escape' });
    await expect(service.mkdir('dangling/child')).rejects.toMatchObject({ reason: 'path_escape' });
    await service.write('..notes', 'inside');
    expect((await service.read('..notes')).content).toBe('inside');
    await expect(service.write('missing-parent/new', 'x')).rejects.toMatchObject({ reason: 'not_found' });
    await expect(service.mkdir('missing-parent/new')).rejects.toMatchObject({ reason: 'not_found' });
  });

  it('does not collapse dot-dot across symlink targets with missing leaves', async () => {
    await symlink('.', path.join(root, 'jump'));
    await symlink('jump/../root-sibling/new', path.join(root, 'indirect-dangling'));
    await expect(service.write('indirect-dangling', 'bad')).rejects.toMatchObject({ reason: 'path_escape' });
    await expect(lstat(path.join(outside, 'new'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('permits dangling in-root file links', async () => {
    await symlink('new', path.join(root, 'internal-dangling'));
    await service.write('internal-dangling', 'inside');
    expect((await service.read('new')).content).toBe('inside');
  });

  it('rejects external link bodies for move/delete without touching referents', async () => {
    await expect(service.move('escape-file', 'renamed')).rejects.toMatchObject({ reason: 'path_escape' });
    await expect(service.delete('escape-file')).rejects.toMatchObject({ reason: 'path_escape' });
    expect((await lstat(path.join(root, 'escape-file'))).isSymbolicLink()).toBe(true);
    expect(await readFile(path.join(outside, 'sentinel'), 'utf8')).toBe('outside fixture');
  });

  it('checks symlinked destination parents when rebasing relative links', async () => {
    await service.mkdir('nested');
    await service.write('local', 'inside');
    await symlink('../local', path.join(root, 'nested/link'));
    await symlink('.', path.join(root, 'alias-root'));
    await expect(service.move('nested/link', 'alias-root/link')).rejects.toMatchObject({ reason: 'path_escape' });
  });

  it('moves directories and safely removes directories containing external links', async () => {
    await service.mkdir('dir');
    await service.write('dir/file', 'inside');
    await service.move('dir', 'moved');
    expect((await service.read('moved/file')).content).toBe('inside');
    await symlink(outside, path.join(root, 'moved/link'));
    await service.delete('moved');
    expect(await readFile(path.join(outside, 'sentinel'), 'utf8')).toBe('outside fixture');
  });

  it('sanitizes native ENOTDIR and ELOOP errors', async () => {
    await service.write('file', 'inside');
    await symlink('loop', path.join(root, 'loop'));
    for (const operation of [() => service.list('file/child'), () => service.read('loop')]) {
      const error = await operation().catch((err: unknown) => err);
      expect(error).toMatchObject({ name: 'FileServiceError' });
      expect((error as Error).message).not.toContain(fixture);
    }
  });

  it('preserves in-root symlinks, new files, mkdir, binary transfer and link-body move/delete', async () => {
    await service.mkdir('actual');
    await symlink('actual', path.join(root, 'alias'));
    await service.write('alias/new', 'inside');
    await service.mkdir('alias/sub');
    await service.writeRaw('alias/sub/data', Buffer.from([0, 255]));
    expect(await service.readRaw('actual/sub/data')).toEqual(Buffer.from([0, 255]));
    expect((await service.read('alias/new')).content).toBe('inside');
    expect((await service.list('.')).entries.find((entry) => entry.name === 'alias')?.type).toBe('directory');
    await service.move('alias', 'renamed-alias');
    expect(await readlink(path.join(root, 'renamed-alias'))).toBe('actual');
    await service.delete('renamed-alias');
    expect((await service.read('actual/new')).content).toBe('inside');
  });

  it('allows a symlinked configured root', async () => {
    await symlink(root, path.join(fixture, 'root-alias'));
    const aliased = new FileService(path.join(fixture, 'root-alias'));
    await aliased.write('new', 'inside');
    expect((await aliased.read('new')).content).toBe('inside');
    await expect(aliased.read('escape-file')).rejects.toMatchObject({ reason: 'path_escape' });
  });

  it('blocks moving a relative symlink (or containing directory) so it would escape', async () => {
    await service.mkdir('nested');
    await symlink('../local', path.join(root, 'nested/link'));
    await service.write('local', 'inside');
    await expect(service.move('nested/link', 'link')).rejects.toMatchObject({ reason: 'path_escape' });
    await service.mkdir('nested/container');
    await symlink('../../local', path.join(root, 'nested/container/link'));
    await expect(service.move('nested/container', 'container')).rejects.toMatchObject({ reason: 'path_escape' });
  });

  it('does not disclose root or external absolute paths in filesystem errors', async () => {
    const actions = [
      () => service.read('missing'),
      () => service.write('missing/child', 'x'),
      () => service.read('escape-file'),
      () => service.readRaw('dangling'),
    ];
    for (const action of actions) {
      const error = await action().catch((err: unknown) => err);
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(fixture);
    }
  });
});
