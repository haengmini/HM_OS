import Fastify from 'fastify';

/**
 * Milestone 0: minimal health-check server only.
 * Milestone 1 adds auth guards (Tailscale identity + PIN) in front of
 * every route below `/healthz`. Milestone 2+ add status/read-model,
 * terminal, and file routes.
 */
export function buildServer() {
  const app = Fastify({ logger: false });

  app.get('/healthz', async () => ({
    status: 'ok',
    service: 'hm-os-api',
    milestone: 'M0',
  }));

  return app;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const app = buildServer();
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
