/**
 * Milestone 4: file browser/editor contracts, shared between
 * apps/api and apps/web. All paths sent over the wire are relative to
 * a single configured root (HM_OS_FILES_ROOT); the server never
 * accepts or returns absolute paths, and rejects any relative path
 * that would escape the root after normalization.
 */

export interface FileEntry {
  /** Path relative to the configured files root, using '/' separators. */
  path: string;
  name: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  mtimeMs: number;
}

export interface ListDirectoryResult {
  path: string;
  entries: FileEntry[];
}

export interface ReadFileResult {
  path: string;
  content: string;
  truncated: boolean;
  sizeBytes: number;
  mtimeMs: number;
}

export interface FileOperationError {
  reason:
    | 'not_found'
    | 'path_escape'
    | 'not_a_directory'
    | 'not_a_file'
    | 'already_exists'
    | 'conflict'
    | 'too_large'
    | 'io_error';
  message: string;
}
