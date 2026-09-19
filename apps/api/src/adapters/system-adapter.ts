import os from 'node:os';
import { statfs } from 'node:fs';
import { promisify } from 'node:util';
import type { OfficeStatusEvent } from '@hm-os/contracts';

const statfsAsync = promisify(statfs);

export interface SystemSnapshot {
  loadAverage: number[];
  cpuCount: number;
  totalMemBytes: number;
  freeMemBytes: number;
  usedMemFraction: number;
  uptimeSeconds: number;
  diskTotalBytes?: number;
  diskFreeBytes?: number;
  diskUsedFraction?: number;
}

export async function readSystemSnapshot(diskPath = '/'): Promise<SystemSnapshot> {
  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();

  const snapshot: SystemSnapshot = {
    loadAverage: os.loadavg(),
    cpuCount: os.cpus().length,
    totalMemBytes,
    freeMemBytes,
    usedMemFraction: totalMemBytes > 0 ? 1 - freeMemBytes / totalMemBytes : 0,
    uptimeSeconds: os.uptime(),
  };

  try {
    const stats = await statfsAsync(diskPath);
    const diskTotalBytes = stats.blocks * stats.bsize;
    const diskFreeBytes = stats.bfree * stats.bsize;
    snapshot.diskTotalBytes = diskTotalBytes;
    snapshot.diskFreeBytes = diskFreeBytes;
    snapshot.diskUsedFraction = diskTotalBytes > 0 ? 1 - diskFreeBytes / diskTotalBytes : 0;
  } catch {
    // statfs unsupported on this platform/path — disk fields stay undefined.
  }

  return snapshot;
}

/**
 * Converts a system snapshot into the shared OfficeStatusEvent shape.
 * A single synthetic entity ("server-main") represents the whole
 * server for the "관제실" room in Milestone 3.
 */
export function toOfficeStatusEvent(snapshot: SystemSnapshot, observedAt = new Date()): OfficeStatusEvent {
  const load1 = snapshot.loadAverage[0] ?? 0;
  const highLoad = load1 / Math.max(snapshot.cpuCount, 1) > 1.5;
  const highMem = snapshot.usedMemFraction > 0.9;
  const highDisk = (snapshot.diskUsedFraction ?? 0) > 0.9;

  const state = highLoad || highMem || highDisk ? 'error' : 'idle';
  const detailParts = [
    `load1=${load1.toFixed(2)}/${snapshot.cpuCount}cpu`,
    `mem=${(snapshot.usedMemFraction * 100).toFixed(0)}%`,
  ];
  if (snapshot.diskUsedFraction !== undefined) {
    detailParts.push(`disk=${(snapshot.diskUsedFraction * 100).toFixed(0)}%`);
  }

  return {
    source: 'system',
    entityId: 'server-main',
    state,
    detail: detailParts.join(' · '),
    observedAt: observedAt.toISOString(),
    confidence: 'fresh',
  };
}
