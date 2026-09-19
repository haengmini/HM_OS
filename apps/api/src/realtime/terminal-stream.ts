import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { parse as parseCookieHeader } from 'cookie';
import { WebSocketServer, type WebSocket } from 'ws';
import type { HmOsConfig } from '../config.js';
import { checkTailscaleIdentity } from '../auth/tailscale-identity.js';
import { SESSION_COOKIE_NAME } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';
import type { AuditLog } from '../audit/audit-log.js';
import { spawnPtySession, type PtySession } from '../terminal/pty-session.js';
import type { TerminalClientMessage, TerminalServerMessage } from '@hm-os/contracts';

/**
 * Manual WebSocket upgrade handler for `/api/terminal`, reusing the
 * exact upgrade-stage identity + session validation pattern from
 * Milestone 2's status stream (see
 * apps/api/src/realtime/status-stream.ts and the Milestone 2 note in
 * docs/architecture/SECURITY.md for why this is manual instead of
 * `@fastify/websocket`).
 *
 * Session re-validation is continuous, not just at connect time: a
 * poll loop checks the session every `lockCheckIntervalMs` and kills
 * the PTY + closes the socket the instant the session locks or
 * expires (Milestone 1 contract: lock must cut PTY access, not just
 * block new HTTP requests).
 */
export function attachTerminalStream(
  httpServer: import('node:http').Server,
  config: HmOsConfig,
  sessionStore: SessionStore,
  auditLog: AuditLog,
  terminalCwd: string,
  lockCheckIntervalMs = 2000,
) {
  const wss = new WebSocketServer({ noServer: true });
  const STREAM_PATH = '/api/terminal';

  httpServer.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? '/', 'http://internal');
    if (url.pathname !== STREAM_PATH) return;

    const identity = checkTailscaleIdentity(req.headers, config.ownerLoginName, config.expectedHost);
    if (!identity.ok) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    const cookies = parseCookieHeader(req.headers.cookie ?? '');
    const sessionId = cookies[SESSION_COOKIE_NAME];
    const session = sessionId ? sessionStore.get(sessionId) : undefined;
    if (!session || session.locked) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
      runTerminalSession(ws, sessionId!, sessionStore, auditLog, terminalCwd, lockCheckIntervalMs);
    });
  });

  return wss;
}

function send(ws: WebSocket, message: TerminalServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function runTerminalSession(
  ws: WebSocket,
  sessionId: string,
  sessionStore: SessionStore,
  auditLog: AuditLog,
  cwd: string,
  lockCheckIntervalMs: number,
) {
  const terminalSessionId = randomUUID();
  const cols = 80;
  const rows = 24;

  let pty: PtySession;
  try {
    pty = spawnPtySession({ cwd, cols, rows });
  } catch (err) {
    send(ws, { type: 'error', message: err instanceof Error ? err.message : 'Failed to start terminal.' });
    ws.close(1011, 'pty_spawn_failed');
    return;
  }

  void auditLog.record({ action: 'terminal_start', sessionId, targetPath: cwd });
  send(ws, { type: 'ready', sessionId: terminalSessionId, cols, rows });

  pty.onData((data) => send(ws, { type: 'output', data }));

  let exited = false;
  pty.onExit(({ exitCode, signal }) => {
    exited = true;
    void auditLog.record({ action: 'terminal_exit', sessionId, exitCode });
    send(ws, { type: 'exit', exitCode, signal });
    ws.close(1000, 'terminal_exited');
  });

  const lockCheckTimer = setInterval(() => {
    const current = sessionStore.get(sessionId);
    if (!current || current.locked) {
      ws.close(4401, 'session_expired');
    }
  }, lockCheckIntervalMs);

  ws.on('message', (raw) => {
    let message: TerminalClientMessage;
    try {
      message = JSON.parse(raw.toString()) as TerminalClientMessage;
    } catch {
      return; // ignore malformed frames
    }

    const current = sessionStore.get(sessionId);
    if (!current || current.locked) {
      ws.close(4401, 'session_expired');
      return;
    }
    sessionStore.touch(sessionId);

    if (message.type === 'input') {
      pty.write(message.data);
    } else if (message.type === 'resize') {
      pty.resize(message.cols, message.rows);
    }
  });

  ws.on('close', () => {
    clearInterval(lockCheckTimer);
    if (!exited) pty.kill();
  });
}
