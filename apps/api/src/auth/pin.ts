import { hash, verify } from '@node-rs/argon2';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * HM OS PIN storage and verification.
 *
 * The PIN itself is never stored or logged in plaintext. Only an
 * Argon2id hash is persisted, in a 0600 file inside a 0700 directory.
 */

interface PinRecord {
  pinHash: string;
  createdAt: string;
  updatedAt: string;
}

export class PinStore {
  private readonly filePath: string;

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, 'pin.json');
  }

  private async ensureDir(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
  }

  async isConfigured(): Promise<boolean> {
    return (await this.read()) !== null;
  }

  async setPin(pin: string): Promise<void> {
    await this.ensureDir();
    const pinHash = await hash(pin);
    const now = new Date().toISOString();
    const existing = await this.read();
    const record: PinRecord = {
      pinHash,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await writeFile(this.filePath, JSON.stringify(record), { mode: 0o600 });
  }

  async verifyPin(pin: string): Promise<boolean> {
    const record = await this.read();
    if (!record) return false;
    return verify(record.pinHash, pin);
  }

  private async read(): Promise<PinRecord | null> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as PinRecord;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'ENOENT') return null;
      throw err;
    }
  }
}
