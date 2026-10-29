import type { FastifyReply, FastifyRequest } from 'fastify';
import { checkTailscaleIdentity } from './tailscale-identity.js';
import type { SessionStore } from './session-store.js';
import type { HmOsConfig } from '../config.js';

export const SESSION_COOKIE_NAME = 'hm_os_session';

declare module 'fastify' {
  interface FastifyRequest {
    hmOsSessionId?: string;
  }
}

/**
 * preHandler: enforces the Tailscale identity + Host check on every
 * request. Must run before any route handler that isn't a pure health
 * probe.
 */
export function tailscaleGuard(config: HmOsConfig) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const result = checkTailscaleIdentity(req.headers, config.ownerLoginName, config.expectedHost);
    if (!result.ok) {
      reply.code(403).send(result.failure);
      return reply;
    }
  };
}

/**
 * preHandler: requires a valid, non-expired, non-locked session cookie.
 * Attaches the resolved session id to the request for downstream use
 * without treating background requests as user activity.
 */
export function sessionGuard(sessionStore: SessionStore) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionId) {
      reply.code(401).send({ reason: 'session_expired', message: 'No session cookie present.' });
      return reply;
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      reply.code(401).send({ reason: 'session_expired', message: 'Session expired or unknown.' });
      return reply;
    }

    if (session.locked) {
      reply.code(401).send({ reason: 'session_expired', message: 'Session is locked.' });
      return reply;
    }

    req.hmOsSessionId = sessionId;
  };
}
