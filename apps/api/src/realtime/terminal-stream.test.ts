import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { SessionStore } from '../auth/session-store.js';
import { loadConfig } from '../config.js';
import type { AuditLog } from '../audit/audit-log.js';

const fixture = vi.hoisted(() => ({ data: (_data: string) => {}, kill: vi.fn(), ws: undefined as unknown }));
vi.mock('../terminal/pty-session.js', () => ({ spawnPtySession: () => ({ kill: fixture.kill, onData: (cb: (data: string) => void) => { fixture.data = cb; }, onExit: vi.fn(), write: vi.fn(), resize: vi.fn() }) }));
vi.mock('ws', () => ({ WebSocketServer: class extends EventEmitter {
  handleUpgrade(_req: unknown, _socket: unknown, _head: unknown, cb: (ws: unknown) => void) { cb(fixture.ws); }
} }));
import { attachTerminalStream } from './terminal-stream.js';

afterEach(() => { vi.useRealTimers(); fixture.kill.mockClear(); });
describe('terminal revocation', () => {
  it.each(['lock', 'destroy', 'idle', 'hard'] as const)('kills immediately and blocks output after %s without waiting for ws close', (mode) => {
    vi.useFakeTimers();
    const server = new EventEmitter();
    const ws = Object.assign(new EventEmitter(), { OPEN: 1, readyState: 1, send: vi.fn(), close: vi.fn() });
    fixture.ws = ws;
    const config = { ...loadConfig(), ownerLoginName: 'test', expectedHost: 'test.tail.net' };
    const store = new SessionStore({ sessionTtlMs: 1000, idleLockMs: 500 });
    const session = store.create('test');
    attachTerminalStream(server as never, config, store, { record: vi.fn() } as unknown as AuditLog, '/tmp', 2000);
    server.emit('upgrade', { url: '/api/terminal', headers: { host: config.expectedHost, 'tailscale-user-login': 'test', cookie: `hm_os_session=${session.sessionId}` } }, {}, Buffer.alloc(0));
    ws.send.mockClear();
    if (mode === 'lock') store.lock(session.sessionId);
    else if (mode === 'destroy') store.destroy(session.sessionId);
    else vi.setSystemTime(Date.now() + (mode === 'idle' ? 600 : 1100));
    if (mode === 'lock' || mode === 'destroy') expect(fixture.kill).toHaveBeenCalledOnce();
    fixture.data('SECRET late PTY output');
    expect(fixture.kill).toHaveBeenCalledOnce();
    expect(ws.send).not.toHaveBeenCalled();
    expect(ws.close).toHaveBeenCalledWith(4401, 'session_expired');
    ws.emit('close');
    expect(fixture.kill).toHaveBeenCalledOnce();
  });
});
