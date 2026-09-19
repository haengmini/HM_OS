import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PinStore } from './pin.js';

describe('PinStore', () => {
  let dataDir: string | undefined;

  afterEach(async () => {
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
    dataDir = undefined;
  });

  it('reports unconfigured before any PIN is set', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-pin-test-'));
    const store = new PinStore(dataDir);
    expect(await store.isConfigured()).toBe(false);
  });

  it('verifies the correct PIN and rejects an incorrect one', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-pin-test-'));
    const store = new PinStore(dataDir);
    await store.setPin('123456');
    expect(await store.isConfigured()).toBe(true);
    expect(await store.verifyPin('123456')).toBe(true);
    expect(await store.verifyPin('000000')).toBe(false);
  });

  it('never writes the plaintext PIN to disk', async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'hm-os-pin-test-'));
    const store = new PinStore(dataDir);
    const plaintext = 'super-secret-pin-1234';
    await store.setPin(plaintext);
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(dataDir, 'pin.json'), 'utf8');
    expect(raw.includes(plaintext)).toBe(false);
  });
});
