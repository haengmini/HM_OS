import * as pty from 'node-pty';

/**
 * Thin wrapper around node-pty for one interactive terminal session.
 * Kept separate from the WebSocket wiring (realtime/terminal-stream.ts)
 * so the PTY lifecycle can be unit-tested without a real socket.
 */
export interface PtySessionOptions {
  cwd: string;
  cols: number;
  rows: number;
  shell?: string;
  env?: Record<string, string | undefined>;
}

export interface PtySession {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onData(listener: (data: string) => void): void;
  onExit(listener: (result: { exitCode: number; signal?: number }) => void): void;
}

const DEFAULT_SHELL = process.env.SHELL ?? '/bin/bash';

export function spawnPtySession(options: PtySessionOptions): PtySession {
  const proc = pty.spawn(options.shell ?? DEFAULT_SHELL, [], {
    name: 'xterm-256color',
    cols: options.cols,
    rows: options.rows,
    cwd: options.cwd,
    env: (options.env ?? process.env) as { [key: string]: string },
  });

  return {
    write: (data) => proc.write(data),
    resize: (cols, rows) => proc.resize(cols, rows),
    kill: () => proc.kill(),
    onData: (listener) => {
      proc.onData(listener);
    },
    onExit: (listener) => {
      proc.onExit(({ exitCode, signal }) => listener({ exitCode, signal }));
    },
  };
}
