import type { FastifyInstance } from 'fastify';
import type { HmOsConfig } from '../config.js';
import { PinStore } from '../auth/pin.js';
import { SessionStore } from '../auth/session-store.js';
import { LoginRateLimiter } from '../auth/rate-limiter.js';
import { checkTailscaleIdentity } from '../auth/tailscale-identity.js';
import { SESSION_COOKIE_NAME, sessionGuard, tailscaleGuard } from '../auth/guards.js';

/**
 * Wires the PIN store, session store, and rate limiter into the
 * given Fastify instance and registers `/api/auth/*` routes.
 *
 * All routes here first run the Tailscale identity check inline
 * (not as a global preHandler) so unauthenticated setup/login can
 * still happen while still requiring a genuine tailnet-proxied
 * request.
 */
export function registerAuthModule(
  app: FastifyInstance,
  config: HmOsConfig,
): { sessionStore: SessionStore; pinStore: PinStore } {
  const pinStore = new PinStore(config.dataDir);
  const sessionStore = new SessionStore({
    sessionTtlMs: config.sessionTtlMs,
    idleLockMs: config.idleLockMs,
  });
  const rateLimiter = new LoginRateLimiter({
    maxFailuresBeforeBackoff: config.maxFailuresBeforeBackoff,
  });

  function requireTailscale(req: { headers: Parameters<typeof checkTailscaleIdentity>[0] }) {
    return checkTailscaleIdentity(req.headers, config.ownerLoginName, config.expectedHost);
  }

  function setSessionCookie(reply: import('fastify').FastifyReply, sessionId: string, expiresAt: string) {
    reply.setCookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'strict',
      path: '/',
      expires: new Date(expiresAt),
    });
  }

  app.get('/api/auth/status', async (req, reply) => {
    const identity = requireTailscale(req);
    if (!identity.ok) {
      reply.code(403);
      return identity.failure;
    }

    const pinConfigured = await pinStore.isConfigured();
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    const session = sessionId ? sessionStore.get(sessionId) : undefined;

    return {
      pinConfigured,
      authenticated: Boolean(session && !session.locked),
      locked: Boolean(session?.locked),
    };
  });

  app.post<{ Body: { pin?: string } }>('/api/auth/setup-pin', async (req, reply) => {
    const identity = requireTailscale(req);
    if (!identity.ok) {
      reply.code(403);
      return identity.failure;
    }

    if (await pinStore.isConfigured()) {
      reply.code(409);
      return { reason: 'invalid_pin', message: 'PIN already configured.' };
    }

    const pin = req.body?.pin;
    if (!pin || pin.length < 4) {
      reply.code(400);
      return { reason: 'invalid_pin', message: 'PIN must be at least 4 characters.' };
    }

    await pinStore.setPin(pin);
    const session = sessionStore.create(identity.loginName!);
    setSessionCookie(reply, session.sessionId, session.expiresAt);
    return { ok: true };
  });

  app.post<{ Body: { pin?: string } }>('/api/auth/login', async (req, reply) => {
    const identity = requireTailscale(req);
    if (!identity.ok) {
      reply.code(403);
      return identity.failure;
    }

    const rateLimitKey = identity.loginName!;
    const waitMs = rateLimiter.msUntilAllowed(rateLimitKey);
    if (waitMs > 0) {
      reply.code(429);
      return {
        reason: 'rate_limited',
        message: `Too many attempts. Try again in ${Math.ceil(waitMs / 1000)}s.`,
      };
    }

    const pin = req.body?.pin;
    const valid = pin ? await pinStore.verifyPin(pin) : false;
    if (!valid) {
      rateLimiter.recordFailure(rateLimitKey);
      reply.code(401);
      return { reason: 'invalid_pin', message: 'Incorrect PIN.' };
    }

    rateLimiter.recordSuccess(rateLimitKey);
    const session = sessionStore.create(identity.loginName!);
    setSessionCookie(reply, session.sessionId, session.expiresAt);
    return { ok: true };
  });

  app.post<{ Body: { pin?: string } }>('/api/auth/unlock', async (req, reply) => {
    const identity = requireTailscale(req);
    if (!identity.ok) {
      reply.code(403);
      return identity.failure;
    }

    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionId || !sessionStore.get(sessionId)) {
      reply.code(401);
      return { reason: 'session_expired', message: 'No session to unlock.' };
    }

    const rateLimitKey = identity.loginName!;
    const waitMs = rateLimiter.msUntilAllowed(rateLimitKey);
    if (waitMs > 0) {
      reply.code(429);
      return {
        reason: 'rate_limited',
        message: `Too many attempts. Try again in ${Math.ceil(waitMs / 1000)}s.`,
      };
    }

    const pin = req.body?.pin;
    const valid = pin ? await pinStore.verifyPin(pin) : false;
    if (!valid) {
      rateLimiter.recordFailure(rateLimitKey);
      reply.code(401);
      return { reason: 'invalid_pin', message: 'Incorrect PIN.' };
    }

    rateLimiter.recordSuccess(rateLimitKey);
    sessionStore.unlock(sessionId);
    return { ok: true };
  });

  app.post('/api/auth/lock', { preHandler: [tailscaleGuard(config)] }, async (req, reply) => {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (sessionId) sessionStore.lock(sessionId);
    reply.code(200);
    return { ok: true };
  });

  app.post('/api/auth/logout', { preHandler: [tailscaleGuard(config)] }, async (req, reply) => {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (sessionId) sessionStore.destroy(sessionId);
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return { ok: true };
  });

  // Explicit activity signal: polling must never refresh the idle deadline.
  app.post('/api/auth/activity', { preHandler: [tailscaleGuard(config), sessionGuard(sessionStore)] }, async (req) => {
    sessionStore.touch(req.hmOsSessionId!);
    return { ok: true };
  });

  // Example of a session-protected route for Milestone 1's own tests;
  // Milestone 2+ real routes (status/office-state/terminal/files) use
  // the same `sessionGuard(sessionStore)` preHandler.
  app.get('/api/auth/whoami', { preHandler: [sessionGuard(sessionStore)] }, async (req) => {
    const sessionId = req.hmOsSessionId!;
    const session = sessionStore.get(sessionId);
    return { ownerLoginName: session?.ownerLoginName };
  });

  return { sessionStore, pinStore };
}
