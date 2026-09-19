import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { loadConfig } from './config.js';
import { registerAuthModule } from './routes/auth.js';

/**
 * Milestone 1: health check + full auth module (Tailscale identity +
 * PIN + session/lock). Milestone 2+ adds status/read-model, terminal,
 * and file routes behind the same guards.
 */
export function buildServer() {
  const app = Fastify({ logger: false });
  const config = loadConfig();

  app.register(cookie);

  app.get('/healthz', async () => ({
    status: 'ok',
    service: 'hm-os-api',
    milestone: 'M1',
  }));

  const { sessionStore, pinStore } = registerAuthModule(app, config);

  return { app, config, sessionStore, pinStore };
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const { app } = buildServer();
  const port = Number(process.env.PORT ?? 8767);
  // Loopback-only bind, per docs/architecture/SECURITY.md.
  app
    .listen({ port, host: '127.0.0.1' })
    .then(() => {
      console.log(`hm-os-api listening on http://127.0.0.1:${port}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
