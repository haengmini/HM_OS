import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';

const OWNER = 'ihyeongmin00@gmail.com';
const HOST = 'hm-os-server.taila8b4a0.ts.net';

function tailscaleHeaders(overrides: Partial<Record<string, string>> = {}) {
  return { host: HOST, 'tailscale-user-login': OWNER, ...overrides };
}

function extractCookie(response: { headers: Record<string, unknown> }): string | undefined {
  const setCookie = response.headers['set-cookie'];
  const raw = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string | undefined);
  return raw?.split(';')[0];
}

describe('GET/POST /api/files/*', () => {
  let app: FastifyInstance;
  let cookie: string;
  let dataDir: string;
  let filesRoot: string;
  let originalEnv: typeof process.env;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-files-route-data-'));
    filesRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-files-route-root-'));
    await mkdir(path.join(filesRoot, 'notes'), { recursive: true });
    await writeFile(path.join(filesRoot, 'notes', 'existing.md'), '# Existing note');

    process.env.HM_OS_OWNER_LOGIN = OWNER;
    process.env.HM_OS_TAILNET_HOSTNAME = HOST;
    process.env.HM_OS_DATA_DIR = dataDir;
    process.env.HM_OS_COOKIE_SECURE = 'false';
    process.env.HM_OS_FILES_ROOT = filesRoot;

    const built = buildServer();
    app = built.app;

    const setup = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '135790' },
    });
    cookie = extractCookie(setup)!;
  });

  afterEach(async () => {
    process.env = originalEnv;
    await rm(dataDir, { recursive: true, force: true });
    await rm(filesRoot, { recursive: true, force: true });
  });

  it('rejects all file routes without a session', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/files/list?path=.', headers: tailscaleHeaders() });
    expect(response.statusCode).toBe(401);
  });

  it('lists the real files root through the HTTP route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/files/list?path=.',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.entries.some((e: { name: string }) => e.name === 'notes')).toBe(true);
  });

  it('writes then reads a file through the HTTP routes', async () => {
    const write = await app.inject({
      method: 'POST',
      url: '/api/files/write',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { path: 'notes/new.md', content: '# New note from HTTP' },
    });
    expect(write.statusCode).toBe(200);

    const read = await app.inject({
      method: 'GET',
      url: '/api/files/read?path=notes%2Fnew.md',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(read.statusCode).toBe(200);
    expect(read.json().content).toBe('# New note from HTTP');
  });

  it('returns 409 when a stale editor tries to overwrite a newer file', async () => {
    const opened = await app.inject({
      method: 'GET', url: '/api/files/read?path=notes%2Fexisting.md',
      headers: { ...tailscaleHeaders(), cookie },
    });
    const mtimeMs = opened.json().mtimeMs;
    await new Promise((resolve) => setTimeout(resolve, 5));
    await writeFile(path.join(filesRoot, 'notes', 'existing.md'), '# external change');
    const staleWrite = await app.inject({
      method: 'POST', url: '/api/files/write',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { path: 'notes/existing.md', content: '# stale write', expectedMtimeMs: mtimeMs },
    });
    expect(staleWrite.statusCode).toBe(409);
    expect(staleWrite.json().reason).toBe('conflict');
  });

  it('rejects a path-escape attempt with 403', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/files/read?path=..%2F..%2Fetc%2Fpasswd',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().reason).toBe('path_escape');
  });

  it('returns 404 for a nonexistent file', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/files/read?path=notes%2Fdoes-not-exist.md',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(response.statusCode).toBe(404);
  });

  it('moves and then deletes a file through the HTTP routes', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/files/write',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { path: 'notes/to-move.md', content: 'move me' },
    });

    const move = await app.inject({
      method: 'POST',
      url: '/api/files/move',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { from: 'notes/to-move.md', to: 'notes/moved.md' },
    });
    expect(move.statusCode).toBe(200);

    const del = await app.inject({
      method: 'POST',
      url: '/api/files/delete',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { path: 'notes/moved.md' },
    });
    expect(del.statusCode).toBe(200);

    const readAfterDelete = await app.inject({
      method: 'GET',
      url: '/api/files/read?path=notes%2Fmoved.md',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(readAfterDelete.statusCode).toBe(404);
  });

  it('uploads binary bytes and downloads them back byte-for-byte', async () => {
    const binary = Buffer.from([0x00, 0xff, 0x42, 0x10, 0x90]);
    const upload = await app.inject({
      method: 'POST',
      url: '/api/files/upload?path=notes%2Fbinary.bin',
      headers: { ...tailscaleHeaders(), cookie, 'content-type': 'application/octet-stream' },
      payload: binary,
    });
    expect(upload.statusCode).toBe(200);

    const download = await app.inject({
      method: 'GET',
      url: '/api/files/download?path=notes%2Fbinary.bin',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(download.statusCode).toBe(200);
    expect(Buffer.from(download.rawPayload).equals(binary)).toBe(true);
  });

  it('writes an audit entry for a write and does not include file content', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/files/write',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { path: 'notes/audited.md', content: 'SENSITIVE CONTENT MARKER' },
    });

    const { readFile } = await import('node:fs/promises');
    const auditRaw = await readFile(path.join(dataDir, 'audit.log'), 'utf8');
    expect(auditRaw).toContain('file_write');
    expect(auditRaw).toContain('notes/audited.md');
    expect(auditRaw).not.toContain('SENSITIVE CONTENT MARKER');
  });
});
