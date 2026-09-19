import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { FileService, FileServiceError } from './file-service.js';

describe('FileService', () => {
  let root: string | undefined;

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
    root = undefined;
  });

  it('lists a directory, sorted directories-first then alphabetically', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.mkdir('zeta-dir');
    await service.write('alpha.txt', 'hello');
    await service.mkdir('alpha-dir');

    const result = await service.list('.');
    const names = result.entries.map((e) => `${e.type}:${e.name}`);
    expect(names).toEqual(['directory:alpha-dir', 'directory:zeta-dir', 'file:alpha.txt']);
  });

  it('writes then reads a file round-trip', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.write('note.md', '# Hello HM OS');
    const result = await service.read('note.md');
    expect(result.content).toBe('# Hello HM OS');
    expect(result.truncated).toBe(false);
  });

  it('detects a concurrent modification using the expected mtime', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.write('conflict.txt', 'first');
    const opened = await service.read('conflict.txt');
    await new Promise((resolve) => setTimeout(resolve, 5));
    await service.write('conflict.txt', 'changed elsewhere');
    await expect(
      service.write('conflict.txt', 'stale editor write', opened.mtimeMs),
    ).rejects.toMatchObject({ reason: 'conflict' });
    expect((await service.read('conflict.txt')).content).toBe('changed elsewhere');
  });

  it('rejects reading a path that escapes the root', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await expect(service.read('../../etc/passwd')).rejects.toMatchObject({ reason: 'path_escape' });
  });

  it('reports not_found for a missing file', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await expect(service.read('does-not-exist.txt')).rejects.toMatchObject({ reason: 'not_found' });
  });

  it('reports not_a_file when reading a directory', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.mkdir('a-dir');
    await expect(service.read('a-dir')).rejects.toMatchObject({ reason: 'not_a_file' });
  });

  it('moves a file to a new relative path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.write('old-name.txt', 'content');
    await service.move('old-name.txt', 'new-name.txt');
    const result = await service.read('new-name.txt');
    expect(result.content).toBe('content');
    await expect(service.read('old-name.txt')).rejects.toMatchObject({ reason: 'not_found' });
  });

  it('deletes a file', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.write('to-delete.txt', 'bye');
    await service.delete('to-delete.txt');
    await expect(service.read('to-delete.txt')).rejects.toMatchObject({ reason: 'not_found' });
  });

  it('mkdir rejects creating an already-existing directory', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    await service.mkdir('dup-dir');
    await expect(service.mkdir('dup-dir')).rejects.toMatchObject({ reason: 'already_exists' });
  });

  it('readRaw/writeRaw round-trip binary data without corruption', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    const binary = Buffer.from([0x00, 0xff, 0x10, 0x80, 0x7f]);
    await service.writeRaw('binary.bin', binary);
    const readBack = await service.readRaw('binary.bin');
    expect(readBack.equals(binary)).toBe(true);

    // Cross-check against the raw filesystem to be extra sure this
    // isn't just the in-memory buffer being echoed back.
    const onDisk = await readFile(path.join(root, 'binary.bin'));
    expect(onDisk.equals(binary)).toBe(true);
  });

  it('exposes FileServiceError as instanceof Error with a stable reason', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'hm-os-files-'));
    const service = new FileService(root);
    try {
      await service.read('nope.txt');
      throw new Error('expected read() to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(FileServiceError);
      expect((err as FileServiceError).reason).toBe('not_found');
    }
  });
});
