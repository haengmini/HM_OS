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

  it('interrupts a long-running command with Ctrl+C and remains usable', async () => {
    const session = spawnPtySession({ cwd: tmpdir(), cols: 80, rows: 24, shell: '/bin/bash' });
    let output = '';
    session.onData((data) => { output += data; });
    session.write('sleep 30\r');
    await new Promise((resolve) => setTimeout(resolve, 150));
    session.write('\x03');
    session.write('echo HM_OS_AFTER_INTERRUPT\r');

    await new Promise<void>((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error(`PTY interrupt output timed out: ${output}`)), 5_000);
      const check = setInterval(() => {
        if (output.includes('HM_OS_AFTER_INTERRUPT')) {
          clearInterval(check);
          clearTimeout(deadline);
          resolve();
        }
      }, 20);
    });
    expect(output).toContain('HM_OS_AFTER_INTERRUPT');
    session.kill();
  }, 10_000);
});
