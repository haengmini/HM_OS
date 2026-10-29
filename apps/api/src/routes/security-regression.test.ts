import { tmpdir } from 'node:os';
import type { ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { buildServer } from '../server.js';
import { SessionStore } from '../auth/session-store.js';
import { loadConfig } from '../config.js';
import { registerChatRoutes } from './chat.js';

const headers = { host: 'test.tail.net', 'tailscale-user-login': 'owner@example.test' };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('HTTP security boundary', () => {
  it.each(['/api/auth/whoami', '/api/devices', '/api/status', '/api/files/list', '/api/chat/history'])('checks identity and Host before %s', async (url) => {
    vi.stubEnv('HM_OS_OWNER_LOGIN', headers['tailscale-user-login']);
    vi.stubEnv('HM_OS_TAILNET_HOSTNAME', headers.host);
    vi.stubEnv('HM_OS_FILES_ROOT', tmpdir());
    const { app, sessionStore } = buildServer();
    const session = sessionStore.create(headers['tailscale-user-login']);
    const cookie = `hm_os_session=${session.sessionId}`;
    try {
      for (const bad of [{ host: headers.host }, { ...headers, host: 'evil.test' }, { ...headers, 'tailscale-user-login': 'other@test' }]) {
        const response = await app.inject({ url, headers: { ...bad, cookie } });
        expect(response.statusCode).toBe(403);
        expect(response.headers['cache-control']).toBe('no-store');
      }
      expect((await app.inject({ url: '/healthz' })).statusCode).toBe(200);
    } finally { await app.close(); }
  });

  it('automatic devices/presence/status requests do not refresh idle activity', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.stubEnv('HM_OS_OWNER_LOGIN', headers['tailscale-user-login']);
    vi.stubEnv('HM_OS_TAILNET_HOSTNAME', headers.host);
    vi.stubEnv('HM_OS_FILES_ROOT', tmpdir());
    vi.stubEnv('HM_OS_IDLE_LOCK_MS', '1000');
    const { app, sessionStore } = buildServer();
    const session = sessionStore.create(headers['tailscale-user-login']);
    const h = { ...headers, cookie: `hm_os_session=${session.sessionId}` };
    try {
      vi.setSystemTime(Date.now() + 600);
      expect((await app.inject({ url: '/api/devices', headers: h })).statusCode).toBe(200);
      expect((await app.inject({ method: 'POST', url: '/api/devices/presence', headers: h, payload: { deviceId: 'iphone', x: 1, y: 1, facing: 'down' } })).statusCode).toBe(200);
      expect((await app.inject({ url: '/api/auth/status', headers: h })).statusCode).toBe(200);
      vi.setSystemTime(Date.now() + 500);
      expect(sessionStore.get(session.sessionId)?.locked).toBe(true);
    } finally { await app.close(); }
  });
});

describe('explicit activity', () => {
  it('refreshes only a live session and cannot unlock or revive an expired session', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.stubEnv('HM_OS_OWNER_LOGIN', headers['tailscale-user-login']);
    vi.stubEnv('HM_OS_TAILNET_HOSTNAME', headers.host);
    vi.stubEnv('HM_OS_IDLE_LOCK_MS', '1000');
    vi.stubEnv('HM_OS_SESSION_TTL_MS', '3000');
    const { app, sessionStore } = buildServer();
    const session = sessionStore.create('test');
    const h = { ...headers, cookie: `hm_os_session=${session.sessionId}` };
    const activity = () => app.inject({ method: 'POST', url: '/api/auth/activity', headers: h });
    try {
      vi.setSystemTime(Date.now() + 600);
      expect((await activity()).statusCode).toBe(200);
      vi.setSystemTime(Date.now() + 600);
      expect(sessionStore.get(session.sessionId)?.locked).toBe(false);
      vi.setSystemTime(Date.now() + 500);
      expect((await activity()).statusCode).toBe(401);
      expect(sessionStore.get(session.sessionId)?.locked).toBe(true);
      vi.setSystemTime(Date.now() + 1400);
      expect((await activity()).statusCode).toBe(401);
      expect(sessionStore.get(session.sessionId)).toBeUndefined();
    } finally { await app.close(); }
  });
});

describe('chat lifecycle', () => {
  async function setup(timeoutMs?: number) {
    const app = Fastify();
    app.register(cookie);
    const store = new SessionStore({ sessionTtlMs: 1000, idleLockMs: 500 });
    const session = store.create('test');
    registerChatRoutes(app, { ...loadConfig(), hermesApiKey: 'synthetic-test-key' }, store, timeoutMs);
    let raw!: ServerResponse;
    app.addHook('onRequest', async (_request, reply) => { raw = reply.raw; });
    await app.ready();
    return { app, store, session, raw: () => raw, request: () => app.inject({ method: 'POST', url: '/api/chat', headers: { cookie: `hm_os_session=${session.sessionId}` }, payload: { message: 'test' } }) };
  }
  it.each(['lock', 'destroy', 'idle', 'hard'] as const)('cancels upstream and prevents output after %s', async (mode) => {
    const ctx = await setup();
    let signal: AbortSignal | undefined;
    let source!: ReadableStreamDefaultController<Uint8Array>;
    const cancelled = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      signal = options.signal;
      return new Response(new ReadableStream({ start(c) { source = c; c.enqueue(new TextEncoder().encode('data: before\n\n')); }, cancel: cancelled }));
    }));
    const pending = ctx.request();
    await vi.waitFor(() => expect(signal).toBeDefined());
    if (mode === 'lock') ctx.store.lock(ctx.session.sessionId);
    else if (mode === 'destroy') ctx.store.destroy(ctx.session.sessionId);
    else {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(Date.now() + (mode === 'idle' ? 600 : 1100));
      await vi.waitFor(() => expect(signal?.aborted).toBe(true));
    }
    // Revoke before a late chunk, without relying on the browser to abort.
    if (!cancelled.mock.calls.length) { source.enqueue(new TextEncoder().encode('data: SECRET-after\n\n')); source.close(); }
    const response = await pending;
    expect(signal?.aborted).toBe(true);
    expect(response.body).not.toContain('SECRET-after');
    expect(cancelled).toHaveBeenCalled();
    await ctx.app.close();
  });
  it.each(['timeout', 'disconnect'] as const)('cancels a stalled body on %s and releases resources', async (mode) => {
    const ctx = await setup(mode === 'timeout' ? 100 : 120_000);
    const cancelled = vi.fn();
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      signal = options.signal;
      return new Response(new ReadableStream({ cancel: cancelled }));
    }));
    const result = ctx.request().then((response) => ({ response }), (error: unknown) => ({ error }));
    await vi.waitFor(() => expect(signal).toBeDefined());
    if (mode === 'disconnect') ctx.raw().emit('close');
    const outcome = await result;
    if (mode === 'timeout') {
      expect('response' in outcome && outcome.response.statusCode).toBe(200);
    } else {
      expect('error' in outcome).toBe(true); // Injection models a destroyed client connection.
    }
    await vi.waitFor(() => expect(cancelled).toHaveBeenCalledOnce());
    expect(signal?.aborted).toBe(true);
    expect(ctx.raw().listeners('close')).toHaveLength(0);
    await ctx.app.close();
  });

  it('times out during upstream header wait without exposing exception details', async () => {
    const ctx = await setup(50);
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('SECRET address')), { once: true });
    })));
    const response = await ctx.request();
    expect(response.statusCode).toBe(502);
    expect(response.body).not.toContain('SECRET');
    await ctx.app.close();
  });

  it('passes normal SSE bytes through and releases resources on completion', async () => {
    const ctx = await setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('data: hello\n\ndata: [DONE]\n\n')));
    const response = await ctx.request();
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/event-stream');
    expect(response.body).toBe('data: hello\n\ndata: [DONE]\n\n');
    expect(ctx.raw().listeners('close')).toHaveLength(0);
    await ctx.app.close();
  });

  it('does not expose upstream errors or bodies', async () => {
    const ctx = await setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('SECRET internal traceback', { status: 500 })));
    const response = await ctx.request();
    expect(response.statusCode).toBe(502);
    expect(response.body).not.toContain('SECRET');
    await ctx.app.close();
  });
});
