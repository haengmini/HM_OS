import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';

const OWNER = 'ihyeongmin00@gmail.com';
const HOST = 'hm-os-server.taila8b4a0.ts.net';

function tailscaleHeaders(overrides: Partial<Record<string, string>> = {}) {
  return {
    host: HOST,
    'tailscale-user-login': OWNER,
    ...overrides,
  };
}

function extractCookie(response: { headers: Record<string, unknown> }): string | undefined {
  const setCookie = response.headers['set-cookie'];
  const raw = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string | undefined);
  return raw?.split(';')[0];
}

describe('GET /api/status', () => {
  let app: FastifyInstance;
  let dataDir: string;
  let profilesDir: string;
  let kanbanDir: string;
  let wikiRoot: string;
  let recentRoot: string;
  let originalEnv: typeof process.env;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-status-data-'));
    profilesDir = await mkdtemp(path.join(tmpdir(), 'hm-os-status-profiles-'));
    kanbanDir = await mkdtemp(path.join(tmpdir(), 'hm-os-status-kanban-'));
    wikiRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-status-wiki-'));
    recentRoot = await mkdtemp(path.join(tmpdir(), 'hm-os-status-recent-'));

    await mkdir(path.join(profilesDir, 'coder'), { recursive: true });
    await writeFile(path.join(profilesDir, 'coder', 'SOUL.md'), '# Coder');
    await writeFile(path.join(wikiRoot, 'index.md'), '# Index');
    await writeFile(path.join(recentRoot, 'notes.txt'), 'hello');

    process.env.HM_OS_OWNER_LOGIN = OWNER;
    process.env.HM_OS_TAILNET_HOSTNAME = HOST;
    process.env.HM_OS_DATA_DIR = dataDir;
    process.env.HM_OS_COOKIE_SECURE = 'false';
    process.env.HM_OS_PROFILES_DIR = profilesDir;
    process.env.HM_OS_KANBAN_DIR = kanbanDir;
    process.env.HM_OS_WIKI_ROOT = wikiRoot;
    process.env.HM_OS_RECENT_DOC_ROOTS = recentRoot;

    const built = buildServer();
    app = built.app;
  });

  afterEach(async () => {
    process.env = originalEnv;
    for (const dir of [dataDir, profilesDir, kanbanDir, wikiRoot, recentRoot]) {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects without a session', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/status',
      headers: tailscaleHeaders(),
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns real aggregated status events for an authenticated session', async () => {
    const setup = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    const cookie = extractCookie(setup)!;

    const response = await app.inject({
      method: 'GET',
      url: '/api/status',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    const sources = body.events.map((e: { source: string }) => e.source).sort();
    expect(sources).toEqual(['agent-os', 'recent-docs', 'system', 'wiki']);
  });
});
