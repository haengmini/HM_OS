import { describe, expect, it } from 'vitest';
import { resolveSafePath, PathEscapeError } from './path-safety.js';

describe('resolveSafePath', () => {
  it('resolves a simple relative path under the root', () => {
    const result = resolveSafePath('/opt/data/root', 'sub/file.txt');
    expect(result.absolutePath).toBe('/opt/data/root/sub/file.txt');
    expect(result.relativePath).toBe('sub/file.txt');
  });

  it('resolves the root itself to "."', () => {
    const result = resolveSafePath('/opt/data/root', '');
    expect(result.relativePath).toBe('.');
    expect(result.absolutePath).toBe('/opt/data/root');
  });

  it('strips leading slashes instead of treating the path as absolute', () => {
    const result = resolveSafePath('/opt/data/root', '/etc/passwd');
    expect(result.absolutePath).toBe('/opt/data/root/etc/passwd');
  });

  it('rejects a path that escapes the root via ../', () => {
    expect(() => resolveSafePath('/opt/data/root', '../outside.txt')).toThrow(PathEscapeError);
  });

  it('rejects a deeply nested escape attempt', () => {
    expect(() => resolveSafePath('/opt/data/root', 'a/b/../../../etc/shadow')).toThrow(PathEscapeError);
  });

  it('allows a path that merely contains ".." in a way that stays inside the root', () => {
    const result = resolveSafePath('/opt/data/root', 'a/b/../c');
    expect(result.relativePath).toBe('a/c');
  });
});
