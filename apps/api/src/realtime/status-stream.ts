import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { parse as parseCookieHeader } from 'cookie';
import { WebSocketServer, type WebSocket } from 'ws';
import type { HmOsConfig } from '../config.js';
import type { AdapterConfig } from '../adapters/config.js';
import { checkTailscaleIdentity } from '../auth/tailscale-identity.js';
import { SESSION_COOKIE_NAME } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';
import { collectOfficeStatusEvents } from '../read-model/office-state.js';

/**
 * Manual WebSocket upgrade handler for `/api/status/stream`.
 *
 * `@fastify/websocket`'s route-hijack integration was found to hand
 * a Fastify `_Request` object (not a real `ws` socket) to the route
 * handler on this server's Node/Fastify version combination — see
 * the Milestone 2 verification notes in docs/architecture/SECURITY.md.
 * Rather than depend on that integration, this attaches a `ws`
 * WebSocketServer directly to the Node HTTP server's `upgrade` event
 * for exactly this one path, re-using the same Tailscale identity and
 * session checks as every HTTP route (Milestone 1 contract: every
 * channel re-validates independently, not just the initial page
 * load). This is also the pattern Milestone 4's PTY/file WebSocket
 * channels will reuse.
 */
export function attachStatusStream(
  httpServer: import('node:http').Server,
  config: HmOsConfig,
  adapterConfig: AdapterConfig,
  sessionStore: SessionStore,
  intervalMs = 5000,
) {
  const wss = new WebSocketServer({ noServer: true });
  const STREAM_PATH = '/api/status/stream';

  httpServer.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? '/', 'http://internal');
    if (url.pathname !== STREAM_PATH) {
      return; // not our path — let any other upgrade listener handle it.
    }

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
      startPushing(ws, sessionId!, sessionStore, adapterConfig, intervalMs);
    });
  });

  return wss;
}

function startPushing(
  ws: WebSocket,
  sessionId: string,
  sessionStore: SessionStore,
  adapterConfig: AdapterConfig,
  intervalMs: number,
) {
  const push = async () => {
    const session = sessionStore.get(sessionId);
    if (!session || session.locked) {
      ws.close(4401, 'session_expired');
      return;
    }
    try {
      const events = await collectOfficeStatusEvents(adapterConfig);
      ws.send(JSON.stringify({ type: 'office-status', events }));
    } catch {
      // A collection failure should not kill the socket; the next
      // tick tries again. Nothing sensitive is logged here.
    }
  };

  void push();
  const timer = setInterval(() => void push(), intervalMs);
  ws.on('close', () => clearInterval(timer));
}
