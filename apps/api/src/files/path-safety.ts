import path from 'node:path';

/**
 * Resolves a client-supplied relative path against a configured root,
 * rejecting anything that would escape the root after normalization
 * (../, absolute paths, symlink-adjacent tricks via '..' segments).
 *
 * This is the single choke point every file/terminal-cwd operation
 * must go through — see docs/architecture/SECURITY.md "실행 권한 경계".
 * It does not resolve symlinks (that's the caller's job via fs.realpath
 * if needed); it only guarantees the *textual* path cannot escape via
 * '..' traversal.
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
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new PathEscapeError(requestedRelativePath);
  }

  return {
    absolutePath: candidate,
    relativePath: relative === '' ? '.' : relative.split(path.sep).join('/'),
  };
}
