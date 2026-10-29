import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AuditLog } from './audit-log.js';

describe('AuditLog', () => {
  let dataDir: string | undefined;

  afterEach(async () => {
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
    dataDir = undefined;
  });

  it('appends a JSON line with only the allowed fields', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-audit-'));
    const log = new AuditLog(dataDir);
    await log.record({ action: 'file_write', sessionId: 'sess-1', targetPath: 'notes/a.md' });

    const raw = await readFile(path.join(dataDir, 'audit.log'), 'utf8');
    const lines = raw.trim().split('\n');
    expect(lines).toHaveLength(1);
    const entry = JSON.parse(lines[0]!);
    expect(entry.action).toBe('file_write');
    expect(entry.sessionId).not.toBe('sess-1');
    expect(entry.sessionId).toMatch(/^[a-f0-9]{64}$/);
    expect(entry.targetPath).toBe('notes/a.md');
    expect(typeof entry.at).toBe('string');
  });

  it('never contains a "content" or "command" field even if such data existed nearby', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-audit-'));
    const log = new AuditLog(dataDir);
    await log.record({ action: 'terminal_start', sessionId: 'sess-2', targetPath: '/opt/data' });
    const raw = await readFile(path.join(dataDir, 'audit.log'), 'utf8');
    const entry = JSON.parse(raw.trim());
    // exitCode is omitted by JSON.stringify when undefined (not passed
    // for a terminal_start entry) — only the fields actually supplied
    // should appear on the wire.
    expect(Object.keys(entry).sort()).toEqual(['action', 'at', 'sessionId', 'targetPath']);
  });

  it('does not persist a reusable session credential', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-audit-'));
    const log = new AuditLog(dataDir);
    const credential = 'synthetic-session-token';
    await log.record({ action: 'file_read', sessionId: credential, targetPath: 'safe.txt' });
    await log.record({ action: 'file_read', sessionId: credential, targetPath: 'safe.txt' });
    const raw = await readFile(path.join(dataDir, 'audit.log'), 'utf8');
    expect(raw).not.toContain(credential);
    const entries = raw.trim().split('\n').map((line) => JSON.parse(line));
    expect(entries[0].sessionId).toMatch(/^[a-f0-9]{64}$/);
    expect(entries[0].sessionId).toBe(entries[1].sessionId);
  });

  it('appends multiple entries in order', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-audit-'));
    const log = new AuditLog(dataDir);
    await log.record({ action: 'terminal_start', sessionId: 's1' });
    await log.record({ action: 'terminal_exit', sessionId: 's1', exitCode: 0 });

    const raw = await readFile(path.join(dataDir, 'audit.log'), 'utf8');
    const lines = raw.trim().split('\n').map((l) => JSON.parse(l));
    expect(lines).toHaveLength(2);
    expect(lines[0].action).toBe('terminal_start');
    expect(lines[1].action).toBe('terminal_exit');
    expect(lines[1].exitCode).toBe(0);
  });
});
