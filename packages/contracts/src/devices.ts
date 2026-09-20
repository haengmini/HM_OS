export const DEVICE_PROFILE_IDS = [
  'acer-nitro-windows',
  'acer-nitro-linux',
  'desktop-windows',
  'iphone',
] as const;

export type DeviceProfileId = (typeof DEVICE_PROFILE_IDS)[number];

export interface DevicePresence {
  deviceId: DeviceProfileId;
  label: string;
  platform: 'windows' | 'linux' | 'ios';
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  lastSeenAt: string;
  online: boolean;
}
