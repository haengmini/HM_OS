import type { FastifyInstance } from 'fastify';
import type { AdapterConfig } from '../adapters/config.js';
import { collectOfficeStatusEvents } from '../read-model/office-state.js';
import { sessionGuard } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';

/**
 * GET /api/status — one-shot snapshot of all normalized office status
 * events. Protected by the same session guard as every other
 * authenticated route (Tailscale identity is enforced upstream by the
 * server-wide preHandler registered in server.ts).
 */
export function registerStatusRoutes(
  app: FastifyInstance,
  config: AdapterConfig,
  sessionStore: SessionStore,
) {
  app.get('/api/status', { preHandler: [sessionGuard(sessionStore)] }, async () => {
    const events = await collectOfficeStatusEvents(config);
    return { events };
  });
}
