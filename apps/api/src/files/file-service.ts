import { readdir, readFile, writeFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import type { FileEntry } from '@hm-os/contracts';
import { resolveSafePath, PathEscapeError } from './path-safety.js';

export class FileServiceError extends Error {
  constructor(
    public readonly reason:
      | 'not_found'
      | 'path_escape'
      | 'not_a_directory'
      | 'not_a_file'
      | 'already_exists'
      | 'conflict'
      | 'too_large'
      | 'io_error',
    message: string,
  ) {
    super(message);
    this.name = 'FileServiceError';
  }
}

const MAX_READ_BYTES = 2 * 1024 * 1024; // 2 MiB — read-in-browser text cap for V1.

/**
 * All file operations for the current server, scoped to a single
 * configured root directory (HM_OS_FILES_ROOT). Every relative path
 * argument passes through resolveSafePath first; a PathEscapeError
 * is normalized to FileServiceError('path_escape') so callers never
 * see the internal error type.
 */
export class FileService {
  constructor(private readonly root: string) {}

  private resolve(relativePath: string) {
    try {
      return resolveSafePath(this.root, relativePath);
    } catch (err) {
      if (err instanceof PathEscapeError) {
        throw new FileServiceError('path_escape', err.message);
      }
      throw err;
    }
  }

  async list(relativePath: string): Promise<{ path: string; entries: FileEntry[] }> {
    const { absolutePath, relativePath: normalized } = this.resolve(relativePath);
    let dirents;
    try {
      dirents = await readdir(absolutePath, { withFileTypes: true });
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }

    const entries: FileEntry[] = [];
    for (const dirent of dirents) {
      const entryAbsolutePath = path.join(absolutePath, dirent.name);
      try {
        const s = await stat(entryAbsolutePath);
        entries.push({
          path: path.posix.join(normalized === '.' ? '' : normalized, dirent.name),
          name: dirent.name,
          type: dirent.isDirectory() ? 'directory' : 'file',
          sizeBytes: dirent.isDirectory() ? undefined : s.size,
          mtimeMs: s.mtimeMs,
        });
      } catch {
        continue; // entry disappeared/unreadable between readdir and stat — skip it
      }
    }
    entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));

    return { path: normalized, entries };
  }

  async read(relativePath: string): Promise<{ path: string; content: string; truncated: boolean; sizeBytes: number; mtimeMs: number }> {
    const { absolutePath, relativePath: normalized } = this.resolve(relativePath);
    let s;
    try {
      s = await stat(absolutePath);
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
    if (!s.isFile()) {
      throw new FileServiceError('not_a_file', `${relativePath} is not a file.`);
    }

    const truncated = s.size > MAX_READ_BYTES;
    const buffer = await readFile(absolutePath);
    const content = buffer.subarray(0, MAX_READ_BYTES).toString('utf8');
    return { path: normalized, content, truncated, sizeBytes: s.size, mtimeMs: s.mtimeMs };
  }

  /** Raw byte read for downloads — no truncation, no UTF-8 decoding. */
  async readRaw(relativePath: string): Promise<Buffer> {
    const { absolutePath } = this.resolve(relativePath);
    let s;
    try {
      s = await stat(absolutePath);
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
    if (!s.isFile()) {
      throw new FileServiceError('not_a_file', `${relativePath} is not a file.`);
    }
    try {
      return await readFile(absolutePath);
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
  }

  /** Raw byte write for uploads — writes the buffer verbatim. */
  async writeRaw(relativePath: string, data: Buffer): Promise<void> {
    const { absolutePath } = this.resolve(relativePath);
    try {
      await writeFile(absolutePath, data);
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
  }

  async write(relativePath: string, content: string, expectedMtimeMs?: number): Promise<void> {
    const { absolutePath } = this.resolve(relativePath);
    try {
      if (expectedMtimeMs !== undefined) {
        const current = await stat(absolutePath);
        if (Math.abs(current.mtimeMs - expectedMtimeMs) > 0.001) {
          throw new FileServiceError('conflict', `${relativePath} changed since it was opened.`);
        }
      }
      await writeFile(absolutePath, content, 'utf8');
    } catch (err) {
      if (err instanceof FileServiceError) throw err;
      throw this.translateFsError(err, absolutePath);
    }
  }

  async mkdir(relativePath: string): Promise<void> {
    const { absolutePath } = this.resolve(relativePath);
    try {
      await mkdir(absolutePath, { recursive: false });
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
  }

  async move(fromRelativePath: string, toRelativePath: string): Promise<void> {
    const from = this.resolve(fromRelativePath);
    const to = this.resolve(toRelativePath);
    try {
      await rename(from.absolutePath, to.absolutePath);
    } catch (err) {
      throw this.translateFsError(err, from.absolutePath);
    }
  }

  async delete(relativePath: string): Promise<void> {
    const { absolutePath } = this.resolve(relativePath);
    try {
      await rm(absolutePath, { recursive: true, force: false });
    } catch (err) {
      throw this.translateFsError(err, absolutePath);
    }
  }

  private translateFsError(err: unknown, absolutePath: string): FileServiceError {
    const code = (err as { code?: string }).code;
    if (code === 'ENOENT') return new FileServiceError('not_found', `Not found: ${absolutePath}`);
    if (code === 'ENOTDIR') return new FileServiceError('not_a_directory', `Not a directory: ${absolutePath}`);
    if (code === 'EEXIST') return new FileServiceError('already_exists', `Already exists: ${absolutePath}`);
    return new FileServiceError('io_error', err instanceof Error ? err.message : 'Unknown I/O error.');
  }
}
