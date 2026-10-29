import path from 'node:path';
import { lstat, readlink, realpath } from 'node:fs/promises';

/**
 * Resolves a client-supplied relative path against a configured root,
 * rejecting anything that would escape the root after normalization
 * (../, absolute paths, symlink-adjacent tricks via '..' segments).
 *
 * This synchronous helper is lexical normalization only. File IO must
 * additionally use resolveSafeFilePath below, which resolves symlink
 * targets and existing ancestors. Neither helper is an OS sandbox.
 */
export interface ResolvedPath {
  absolutePath: string;
  relativePath: string;
}

export class PathEscapeError extends Error {
  constructor(public readonly requestedPath: string) {
    super(`Path escapes the configured root: ${requestedPath}`);
    this.name = 'PathEscapeError';
  }
}

export function resolveSafePath(root: string, requestedRelativePath: string): ResolvedPath {
  // Reject absolute paths outright — every path coming over the wire
  // must be relative to `root`.
  const normalizedRequest = requestedRelativePath.replace(/^\/+/, '');
  const absoluteRoot = path.resolve(root);
  const candidate = path.resolve(absoluteRoot, normalizedRequest);

  const relative = path.relative(absoluteRoot, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new PathEscapeError(requestedRelativePath);
  }

  return {
    absolutePath: candidate,
    relativePath: relative === '' ? '.' : relative.split(path.sep).join('/'),
  };
}
/** Resolve missing tails too, including dangling symlinks, without creating anything. */
async function resolvePhysicalPath(candidate: string, links = 0): Promise<string> {
  if (links > 40) throw new PathEscapeError('symlink loop');
  try {
    return await realpath(candidate);
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
  }
  try {
    if ((await lstat(candidate)).isSymbolicLink()) {
      const target = await readlink(candidate);
      // Do not normalize '..' before the kernel resolves preceding symlinks.
      const expanded = path.isAbsolute(target) ? target : `${path.dirname(candidate)}${path.sep}${target}`;
      return resolvePhysicalPath(expanded, links + 1);
    }
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
  }
  const parent = path.dirname(candidate);
  if (parent === candidate) throw new PathEscapeError('unresolvable root');
  return path.join(await resolvePhysicalPath(parent, links), path.basename(candidate));
}

/**
 * File-service boundary check, in addition to lexical normalization. Missing
 * targets are checked through their existing ancestors (including symlinks).
 * Return the lexical leaf so rename/rm operate on the link, not its referent.
 * This is NOT an OS sandbox: a same-UID process can still race these checks.
 */
export async function resolveSafeFilePath(root: string, requestedPath: string): Promise<ResolvedPath> {
  const resolved = resolveSafePath(root, requestedPath);
  const physicalRoot = await realpath(root);
  for (const candidate of [path.dirname(resolved.absolutePath), resolved.absolutePath]) {
    // The root itself has a parent outside the root; only check its target.
    if (resolved.relativePath === '.' && candidate !== resolved.absolutePath) continue;
    const physical = await resolvePhysicalPath(candidate);
    const relative = path.relative(physicalRoot, physical);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new PathEscapeError(requestedPath);
    }
  }
  return resolved;
}
