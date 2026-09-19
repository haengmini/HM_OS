import type { FastifyRequest } from 'fastify';
import type { AuthFailure } from '@hm-os/contracts';

/**
 * Validates the Tailscale-injected identity headers that Tailscale
 * Serve attaches to proxied requests, plus the request Host.
 *
 * This is the FIRST auth factor. It never reads or trusts a cookie —
 * a local process on the same host could otherwise forge headers, but
 * combined with loopback-only bind + Tailscale Serve as the only route
 * in, this check narrows requests to genuinely proxied tailnet traffic
 * in production. See docs/architecture/SECURITY.md.
 */
export interface TailscaleCheckResult {
  ok: boolean;
  failure?: AuthFailure;
  loginName?: string;
}

export function checkTailscaleIdentity(
  req: FastifyRequest,
  expectedOwnerLogin: string,
  expectedHost: string,
): TailscaleCheckResult {
  const host = req.headers.host;
  if (host !== expectedHost) {
    return {
      ok: false,
      failure: {
        reason: 'invalid_host',
        message: 'Request Host does not match the configured HM OS hostname.',
      },
    };
  }

  const loginNameHeader = req.headers['tailscale-user-login'];
  const loginName = Array.isArray(loginNameHeader) ? loginNameHeader[0] : loginNameHeader;

  if (!loginName || loginName !== expectedOwnerLogin) {
    return {
      ok: false,
      failure: {
        reason: 'missing_identity',
        message: 'Missing or unrecognized Tailscale user identity.',
      },
    };
  }

  return { ok: true, loginName };
}
