import type { DevicePresence, DeviceProfileId } from '@hm-os/contracts';

const DEVICE_META: Record<DeviceProfileId, Pick<DevicePresence, 'label' | 'platform'>> = {
  'acer-nitro-windows': { label: 'Acer Nitro · Windows', platform: 'windows' },
  'acer-nitro-linux': { label: 'Acer Nitro · Linux', platform: 'linux' },
  'desktop-windows': { label: 'Desktop · Windows', platform: 'windows' },
  iphone: { label: 'iPhone', platform: 'ios' },
};

export class DevicePresenceStore {
  private readonly devices = new Map<DeviceProfileId, DevicePresence>();
  constructor(private readonly now: () => Date = () => new Date(), private readonly onlineWindowMs = 30_000) {}

  update(deviceId: DeviceProfileId, position: Pick<DevicePresence, 'x' | 'y' | 'facing'>): DevicePresence {
    const meta = DEVICE_META[deviceId];
    const presence: DevicePresence = {
      deviceId,
      ...meta,
      x: Math.max(0, Math.min(29, Math.round(position.x))),
      y: Math.max(0, Math.min(17, Math.round(position.y))),
      facing: position.facing,
      lastSeenAt: this.now().toISOString(),
      online: true,
    };
    this.devices.set(deviceId, presence);
    return presence;
  }

  list(): DevicePresence[] {
    const now = this.now().getTime();
    return [...this.devices.values()].map((device) => ({
      ...device,
      online: now - new Date(device.lastSeenAt).getTime() <= this.onlineWindowMs,
    }));
  }
}
