import type { FastifyInstance } from 'fastify';
import type { HmOsConfig } from '../config.js';
import { sessionGuard } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';

const HERMES_SESSION_ID = 'hm-os-owner-chat';
const HERMES_SESSION_KEY = 'hm-os-owner';

export function registerChatRoutes(app: FastifyInstance, config: HmOsConfig, sessionStore: SessionStore) {
  const guard = { preHandler: [sessionGuard(sessionStore)] };

  app.get('/api/chat/history', guard, async (_request, reply) => {
    if (!config.hermesApiKey) return reply.code(503).send({ reason: 'chat_unavailable', message: 'Hermes API key is not configured.' });
    const upstream = await fetch(`${config.hermesApiUrl}/api/sessions/${HERMES_SESSION_ID}/messages`, {
      headers: { authorization: `Bearer ${config.hermesApiKey}` },
    });
    if (upstream.status === 404) return { messages: [] };
    if (!upstream.ok) return reply.code(502).send({ reason: 'hermes_error', message: `Hermes history failed (${upstream.status}).` });
    return reply.send(await upstream.json());
  });

  app.post<{ Body: { message?: string } }>('/api/chat', guard, async (request, reply) => {
    const message = request.body?.message?.trim();
    if (!message || message.length > 8_000) return reply.code(400).send({ reason: 'invalid_message', message: 'Message must be 1–8000 characters.' });
    if (!config.hermesApiKey) return reply.code(503).send({ reason: 'chat_unavailable', message: 'Hermes API key is not configured.' });

    const controller = new AbortController();
    reply.raw.on('close', () => controller.abort());
    let upstream: Response;
    try {
      upstream = await fetch(`${config.hermesApiUrl}/v1/chat/completions`, {
        method: 'POST', signal: controller.signal,
        headers: {
          authorization: `Bearer ${config.hermesApiKey}`,
          'content-type': 'application/json',
          'x-hermes-session-id': HERMES_SESSION_ID,
          'x-hermes-session-key': HERMES_SESSION_KEY,
        },
        body: JSON.stringify({
          model: 'hermes-agent', stream: true,
          messages: [
            { role: 'system', content: 'You are Hermes inside the owner\'s HM OS colony interface. Reply naturally in Korean unless asked otherwise. Be concise but fully useful.' },
            { role: 'user', content: message },
          ],
        }),
      });
    } catch (error) {
      return reply.code(502).send({ reason: 'hermes_offline', message: error instanceof Error ? error.message : 'Hermes API is unavailable.' });
    }
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      return reply.code(502).send({ reason: 'hermes_error', message: detail.slice(0, 500) || `Hermes returned ${upstream.status}.` });
    }

    reply.hijack();
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    });
    const reader = upstream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply.raw.write(value);
      }
    } finally {
      reply.raw.end();
      reader.releaseLock();
    }
  });
}
