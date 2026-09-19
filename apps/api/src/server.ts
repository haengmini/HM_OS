import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { loadConfig } from './config.js';
import { loadAdapterConfig } from './adapters/config.js';
import { registerAuthModule } from './routes/auth.js';
import { registerStatusRoutes } from './routes/status.js';
import { attachStatusStream } from './realtime/status-stream.js';

/**
 * Milestone 2: adds the real-data status read-model (system, Agent
 * OS, Wiki, recent documents) behind the Milestone 1 auth guards, as
 * both a one-shot HTTP snapshot and a polling WebSocket stream.
 *
 * The WebSocket stream attaches directly to the underlying Node HTTP
 * server (see realtime/status-stream.ts for why), so it is wired up
 * after `app.ready()` resolves the server instance rather than via a
 * Fastify plugin.
 */
export function buildServer() {
  const app = Fastify({ logger: false });
  const config = loadConfig();
  const adapterConfig = loadAdapterConfig();

  app.register(cookie);

  app.get('/healthz', async () => ({
    status: 'ok',
    service: 'hm-os-api',
    milestone: 'M2',
  }));

  const { sessionStore, pinStore } = registerAuthModule(app, config);
  registerStatusRoutes(app, adapterConfig, sessionStore);

  let statusStreamAttached = false;
  function attachStatusStreamOnce() {
    if (statusStreamAttached) return;
    statusStreamAttached = true;
    attachStatusStream(app.server, config, adapterConfig, sessionStore);
  }

  return { app, config, adapterConfig, sessionStore, pinStore, attachStatusStreamOnce };
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const { app, attachStatusStreamOnce } = buildServer();
  const port = Number(process.env.PORT ?? 8767);
  // Loopback-only bind, per docs/architecture/SECURITY.md.
  app
    .listen({ port, host: '127.0.0.1' })
    .then(() => {
      attachStatusStreamOnce();
      console.log(`hm-os-api listening on http://127.0.0.1:${port}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
