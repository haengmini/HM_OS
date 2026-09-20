import type { FastifyInstance } from 'fastify';
import type { DevicePresence, DeviceProfileId } from '@hm-os/contracts';
import { sessionGuard } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';
import { DevicePresenceStore } from '../devices/device-presence.js';

const DEVICE_PROFILE_IDS: readonly DeviceProfileId[] = [
  'acer-nitro-windows', 'acer-nitro-linux', 'desktop-windows', 'iphone',
];

interface PresenceBody {
  deviceId: DeviceProfileId;
  x: number;
  y: number;
  facing: DevicePresence['facing'];
}

export function registerDeviceRoutes(app: FastifyInstance, sessionStore: SessionStore, store = new DevicePresenceStore()) {
  const guard = { preHandler: [sessionGuard(sessionStore)] };

  app.get('/api/devices', guard, async () => ({ devices: store.list() }));
  app.post<{ Body: PresenceBody }>('/api/devices/presence', guard, async (request, reply) => {
    const body = request.body;
    if (!body || !DEVICE_PROFILE_IDS.includes(body.deviceId) || !Number.isFinite(body.x) ||
        !Number.isFinite(body.y) || !['up', 'down', 'left', 'right'].includes(body.facing)) {
      return reply.code(400).send({ reason: 'invalid_device', message: 'Invalid device presence payload.' });
    }
    return { device: store.update(body.deviceId, body) };
  });

  return store;
}
