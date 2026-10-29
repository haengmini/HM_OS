import type { FastifyInstance } from 'fastify';
import type { HmOsConfig } from '../config.js';
import { sessionGuard } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';

const HERMES_SESSION_ID = 'hm-os-owner-chat';
const HERMES_SESSION_KEY = 'hm-os-owner';

export function registerChatRoutes(app: FastifyInstance, config: HmOsConfig, sessionStore: SessionStore, timeoutMs = 120_000) {
  const guard = { preHandler: [sessionGuard(sessionStore)] };

  // Covers header wait, body consumption and stalled streams, not just fetch().
  function lifetime(sessionId: string, raw: import('node:http').ServerResponse) {
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const stop = () => {
      if (controller.signal.aborted) return;
      controller.abort();
      void reader?.cancel().catch(() => {});
      if (raw.headersSent && !raw.destroyed) raw.end();
    };
    const unsubscribe = sessionStore.onInvalidated(sessionId, stop);
    const valid = () => {
      const session = sessionStore.get(sessionId);
      if (!session || session.locked) stop();
      return !controller.signal.aborted;
    };
    const timer = setInterval(valid, 250);
    const timeout = setTimeout(stop, timeoutMs);
    raw.on('close', stop);
    return {
      signal: controller.signal, valid, stop,
      setReader(value: ReadableStreamDefaultReader<Uint8Array>) { reader = value; },
      cleanup() {
        clearInterval(timer);
        clearTimeout(timeout);
        unsubscribe();
        raw.off('close', stop);
        stop();
      },
    };
  }

  app.get('/api/chat/history', guard, async (request, reply) => {
    if (!config.hermesApiKey) return reply.code(503).send({ reason: 'chat_unavailable', message: 'Chat is unavailable.' });
    const life = lifetime(request.hmOsSessionId!, reply.raw);
    try {
      const upstream = await fetch(`${config.hermesApiUrl}/api/sessions/${HERMES_SESSION_ID}/messages`, {
        signal: life.signal, headers: { authorization: `Bearer ${config.hermesApiKey}` },
      });
      if (!life.valid()) { await upstream.body?.cancel(); return reply.code(401).send({ reason: 'session_expired' }); }
      if (upstream.status === 404) { await upstream.body?.cancel(); return { messages: [] }; }
      if (!upstream.ok) { await upstream.body?.cancel(); return reply.code(502).send({ reason: 'hermes_error', message: 'Chat history is unavailable.' }); }
      const result: unknown = await upstream.json();
      if (!life.valid()) return reply.code(401).send({ reason: 'session_expired' });
      return reply.send(result);
    } catch {
      return reply.code(502).send({ reason: 'hermes_error', message: 'Chat history is unavailable.' });
    } finally { life.cleanup(); }
  });

  app.post<{ Body: { message?: string } }>('/api/chat', guard, async (request, reply) => {
    const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
    if (!message || message.length > 8_000) return reply.code(400).send({ reason: 'invalid_message', message: 'Message must be 1–8000 characters.' });
    if (!config.hermesApiKey) return reply.code(503).send({ reason: 'chat_unavailable', message: 'Chat is unavailable.' });

    const life = lifetime(request.hmOsSessionId!, reply.raw);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const upstream = await fetch(`${config.hermesApiUrl}/v1/chat/completions`, {
        method: 'POST', signal: life.signal,
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
      if (!life.valid()) {
        await upstream.body?.cancel();
        return reply.code(401).send({ reason: 'session_expired' });
      }
      if (!upstream.ok || !upstream.body) {
        await upstream.body?.cancel();
        return reply.code(502).send({ reason: 'hermes_error', message: 'Chat is unavailable.' });
      }

      reply.hijack();
      reply.raw.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
      });
      reader = upstream.body.getReader();
      life.setReader(reader);
      while (life.valid()) {
        const { done, value } = await reader.read();
        if (done || !life.valid() || reply.raw.destroyed) break;
        if (!reply.raw.write(value)) {
          // Bound buffering for a slow/disconnected consumer; release every listener.
          await new Promise<void>((resolve) => {
            const resume = () => {
              reply.raw.off('drain', resume);
              life.signal.removeEventListener('abort', resume);
              resolve();
            };
            reply.raw.once('drain', resume);
            life.signal.addEventListener('abort', resume, { once: true });
            if (life.signal.aborted) resume();
          });
        }
      }
    } catch {
      // Never forward upstream bodies, URLs, exception messages or stack traces.
      if (!reply.raw.headersSent && !reply.raw.destroyed) {
        return reply.code(502).send({ reason: 'hermes_offline', message: 'Chat is unavailable.' });
      }
    } finally {
      life.cleanup();
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (reply.raw.headersSent && !reply.raw.destroyed) reply.raw.end();
    }
  });
}
