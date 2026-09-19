import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { stat } from 'node:fs/promises';

/** Serves the built React PWA from the same private origin as the API. */
export async function registerWebApp(app: FastifyInstance, webDist: string) {
  try {
    await stat(path.join(webDist, 'index.html'));
  } catch {
    // Development/API-only mode: Vite serves the frontend separately.
    return;
  }

  await app.register(fastifyStatic, { root: webDist, wildcard: false });
  app.get('/*', async (req, reply) => {
    if (req.url.startsWith('/api/')) return reply.code(404).send({ message: 'Not found.' });
    return reply.sendFile('index.html');
  });
}
