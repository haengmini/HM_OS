import { describe, expect, it } from 'vitest';
import { tmpdir } from 'node:os';
import { spawnPtySession } from './pty-session.js';

describe('spawnPtySession (real PTY, not mocked)', () => {
  it('spawns a real shell and echoes real output for a real command', async () => {
    const session = spawnPtySession({ cwd: tmpdir(), cols: 80, rows: 24, shell: '/bin/bash' });

    const output = await new Promise<string>((resolve) => {
      let collected = '';
      session.onData((data) => {
        collected += data;
        if (collected.includes('hm-os-pty-marker-12345')) {
          resolve(collected);
        }
      });
      session.write('echo hm-os-pty-marker-12345\r');
    });

    expect(output).toContain('hm-os-pty-marker-12345');
    session.kill();
  }, 10_000);

  it('reports a real exit code when the shell process exits', async () => {
    const session = spawnPtySession({ cwd: tmpdir(), cols: 80, rows: 24, shell: '/bin/bash' });

    const exitResult = await new Promise<{ exitCode: number }>((resolve) => {
      session.onExit((result) => resolve(result));
      session.write('exit 0\r');
    });

    expect(exitResult.exitCode).toBe(0);
  }, 10_000);

  it('resize does not throw for a live session', () => {
    const session = spawnPtySession({ cwd: tmpdir(), cols: 80, rows: 24, shell: '/bin/bash' });
    expect(() => session.resize(120, 40)).not.toThrow();
    session.kill();
  });
});
