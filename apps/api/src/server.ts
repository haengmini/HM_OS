import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { loadConfig } from './config.js';
import { loadAdapterConfig } from './adapters/config.js';
import { registerAuthModule } from './routes/auth.js';
import { registerStatusRoutes } from './routes/status.js';
import { registerFileRoutes } from './routes/files.js';
import { registerDeviceRoutes } from './routes/devices.js';
import { registerChatRoutes } from './routes/chat.js';
import { registerWebApp } from './routes/web-app.js';
import { attachStatusStream } from './realtime/status-stream.js';
import { attachTerminalStream } from './realtime/terminal-stream.js';
import { AuditLog } from './audit/audit-log.js';
import { tailscaleGuard } from './auth/guards.js';

/**
 * Milestone 4: adds real PTY terminal access (WebSocket) and real
 * file browse/read/write/mkdir/move/delete/upload/download (HTTP),
 * both scoped to this server and gated behind the Milestone 1 auth
 * guards, with every mutating file/terminal action written to an
 * append-only audit log (docs/architecture/SECURITY.md).
 *
 * Both WebSocket streams (status, terminal) attach directly to the
 * underlying Node HTTP server — see realtime/status-stream.ts for why
 * — so they are wired up after `app.ready()`/`listen()` resolves the
 * server instance rather than via a Fastify plugin.
 */
export function buildServer() {
  const app = Fastify({ logger: false, bodyLimit: 10 * 1024 * 1024 });
  const config = loadConfig();
  const adapterConfig = loadAdapterConfig();
  const auditLog = new AuditLog(config.dataDir);

  app.register(cookie);
  const identityGuard = tailscaleGuard(config);
  app.addHook('onRequest', async (request, reply) => {
    const pathname = request.raw.url?.split('?')[0] ?? '';
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      reply.header('cache-control', 'no-store');
      reply.raw.setHeader('cache-control', 'no-store'); // Also covers hijacked streams.
      return identityGuard(request, reply);
    }
  });

  // Fastify only parses application/json and text/plain by default;
  // file uploads need the raw bytes untouched.
  app.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (_req, body, done) => {
    done(null, body);
  });

  app.get('/healthz', async () => ({
    status: 'ok',
    service: 'hm-os-api',
    milestone: 'M6-village',
  }));

  const { sessionStore, pinStore } = registerAuthModule(app, config);
  registerStatusRoutes(app, adapterConfig, sessionStore);
  registerFileRoutes(app, config.filesRoot, sessionStore, auditLog);
  registerDeviceRoutes(app, sessionStore);
  registerChatRoutes(app, config, sessionStore);
  app.register(async (webApp) => {
    const webDist = new URL('../../web/dist/', import.meta.url).pathname;
    await registerWebApp(webApp, webDist);
  });

  let streamsAttached = false;
  function attachStreamsOnce() {
    if (streamsAttached) return;
    streamsAttached = true;
    attachStatusStream(app.server, config, adapterConfig, sessionStore);
    attachTerminalStream(app.server, config, sessionStore, auditLog, config.terminalCwd);
  }

  return { app, config, adapterConfig, sessionStore, pinStore, auditLog, attachStreamsOnce };
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const { app, attachStreamsOnce } = buildServer();
  const port = Number(process.env.PORT ?? 8767);
  // Loopback-only bind, per docs/architecture/SECURITY.md.
  app
    .listen({ port, host: '127.0.0.1' })
    .then(() => {
      attachStreamsOnce();
      console.log(`hm-os-api listening on http://127.0.0.1:${port}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
