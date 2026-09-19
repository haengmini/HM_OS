/**
 * Auth/session contracts shared between apps/api and apps/web.
 * Milestone 1 implements the real guards; this defines the shape.
 */

export interface TailscaleIdentity {
  loginName: string;
  host: string;
}

export interface SessionInfo {
  sessionId: string;
  ownerLoginName: string;
  createdAt: string;
  expiresAt: string;
  locked: boolean;
}

export type AuthFailureReason =
  | 'invalid_host'
  | 'missing_identity'
  | 'invalid_pin'
  | 'rate_limited'
  | 'session_expired';

export interface AuthFailure {
  reason: AuthFailureReason;
  message: string;
}
