import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
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

async function makeApp(dataDir: string, envOverrides: Record<string, string> = {}) {
  const originalEnv = { ...process.env };
  process.env.HM_OS_OWNER_LOGIN = OWNER;
  process.env.HM_OS_TAILNET_HOSTNAME = HOST;
  process.env.HM_OS_DATA_DIR = dataDir;
  process.env.HM_OS_COOKIE_SECURE = 'false';
  process.env.HM_OS_MAX_FAILURES_BEFORE_BACKOFF = '2';
  Object.assign(process.env, envOverrides);
  const built = buildServer();
  return { ...built, restoreEnv: () => (process.env = originalEnv) };
}

function extractCookie(response: { headers: Record<string, unknown> }): string | undefined {
  const setCookie = response.headers['set-cookie'];
  const raw = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string | undefined);
  return raw?.split(';')[0];
}

describe('auth module', () => {
  let dataDir: string;
  let app: FastifyInstance;
  let restoreEnv: () => void;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-auth-test-'));
    const built = await makeApp(dataDir);
    app = built.app;
    restoreEnv = built.restoreEnv;
  });

  afterEach(async () => {
    restoreEnv();
    await rm(dataDir, { recursive: true, force: true });
  });

  it('rejects requests with the wrong Host header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/status',
      headers: tailscaleHeaders({ host: 'evil.example.com' }),
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().reason).toBe('invalid_host');
  });

  it('rejects requests with a missing Tailscale identity header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/status',
      headers: { host: HOST },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().reason).toBe('missing_identity');
  });

  it('rejects requests with the wrong Tailscale identity', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/status',
      headers: tailscaleHeaders({ 'tailscale-user-login': 'someone-else@example.com' }),
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().reason).toBe('missing_identity');
  });

  it('allows first-time PIN setup and issues a session cookie', async () => {
    const setup = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    expect(setup.statusCode).toBe(200);
    const cookie = extractCookie(setup);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/^hm_os_session=/);

    const whoami = await app.inject({
      method: 'GET',
      url: '/api/auth/whoami',
      headers: { ...tailscaleHeaders(), cookie: cookie! },
    });
    expect(whoami.statusCode).toBe(200);
    expect(whoami.json().ownerLoginName).toBe(OWNER);
  });

  it('rejects a second PIN setup once one is configured', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '654321' },
    });
    expect(second.statusCode).toBe(409);
  });

  it('logs in with the correct PIN and rejects the wrong PIN', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });

    const wrong = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: tailscaleHeaders(),
      payload: { pin: '000000' },
    });
    expect(wrong.statusCode).toBe(401);

    const right = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    expect(right.statusCode).toBe(200);
    expect(extractCookie(right)).toBeDefined();
  });

  it('rate-limits repeated failed logins', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });

    // maxFailuresBeforeBackoff=2 in this test env
    await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: tailscaleHeaders(),
      payload: { pin: 'wrong' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: tailscaleHeaders(),
      payload: { pin: 'wrong' },
    });
    const third = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' }, // even the CORRECT pin is blocked while rate-limited
    });
    expect(third.statusCode).toBe(429);
  });

  it('rejects protected routes without a session cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/whoami',
      headers: tailscaleHeaders(),
    });
    expect(response.statusCode).toBe(401);
  });

  it('locks the session and blocks the protected route until unlocked', async () => {
    const setup = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    const cookie = extractCookie(setup)!;

    const lock = await app.inject({
      method: 'POST',
      url: '/api/auth/lock',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(lock.statusCode).toBe(200);

    const blocked = await app.inject({
      method: 'GET',
      url: '/api/auth/whoami',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(blocked.statusCode).toBe(401);

    const unlock = await app.inject({
      method: 'POST',
      url: '/api/auth/unlock',
      headers: { ...tailscaleHeaders(), cookie },
      payload: { pin: '123456' },
    });
    expect(unlock.statusCode).toBe(200);

    const unblocked = await app.inject({
      method: 'GET',
      url: '/api/auth/whoami',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(unblocked.statusCode).toBe(200);
  });

  it('destroys the session on logout', async () => {
    const setup = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-pin',
      headers: tailscaleHeaders(),
      payload: { pin: '123456' },
    });
    const cookie = extractCookie(setup)!;

    const logout = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(logout.statusCode).toBe(200);

    const afterLogout = await app.inject({
      method: 'GET',
      url: '/api/auth/whoami',
      headers: { ...tailscaleHeaders(), cookie },
    });
    expect(afterLogout.statusCode).toBe(401);
  });
});
