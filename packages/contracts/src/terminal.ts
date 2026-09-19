/**
 * Milestone 4: terminal (PTY) WebSocket protocol contracts, shared
 * between apps/api and apps/web.
 *
 * Every message is JSON-framed over the same WebSocket connection so
 * a single socket carries both PTY output and lifecycle/control
 * messages, avoiding a second connection per terminal tab.
 */

/** Client -> server */
export type TerminalClientMessage =
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number };

/** Server -> client */
export type TerminalServerMessage =
  | { type: 'ready'; sessionId: string; cols: number; rows: number }
  | { type: 'output'; data: string }
  | { type: 'exit'; exitCode: number; signal?: number }
  | { type: 'error'; message: string };
