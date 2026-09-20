import { useEffect, useState } from 'react';
import type { DevicePresence, DeviceProfileId } from '@hm-os/contracts';
import type { TilePoint } from './colonyMap.js';

const STORAGE_KEY = 'hm-os-device-profile';

export const DEVICE_OPTIONS: ReadonlyArray<{ id: DeviceProfileId; label: string; icon: string }> = [
  { id: 'acer-nitro-windows', label: 'Acer Nitro · Windows', icon: 'N' },
  { id: 'acer-nitro-linux', label: 'Acer Nitro · Linux', icon: 'L' },
  { id: 'desktop-windows', label: 'Desktop · Windows', icon: 'D' },
  { id: 'iphone', label: 'iPhone', icon: 'I' },
];

export function suggestedDevice(): DeviceProfileId {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad/.test(ua)) return 'iphone';
  if (/linux/.test(ua) && !/android/.test(ua)) return 'acer-nitro-linux';
  return 'acer-nitro-windows';
}

export function loadDeviceProfile(): DeviceProfileId | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return DEVICE_OPTIONS.some((option) => option.id === value) ? value as DeviceProfileId : null;
}

export function saveDeviceProfile(deviceId: DeviceProfileId) {
  localStorage.setItem(STORAGE_KEY, deviceId);
}

export function clearDeviceProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useDevicePresence(deviceId: DeviceProfileId | null, position: TilePoint, facing: DevicePresence['facing']) {
  const [devices, setDevices] = useState<DevicePresence[]>([]);

  useEffect(() => {
    if (!deviceId) return;
    let active = true;
    const sync = async () => {
      try {
        await fetch('/api/devices/presence', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ deviceId, ...position, facing }),
        });
        const response = await fetch('/api/devices');
        if (response.ok && active) setDevices((await response.json()).devices);
      } catch { /* connection indicator already reports network state */ }
    };
    void sync();
    const timer = window.setInterval(sync, 10_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [deviceId, position.x, position.y, facing]);

  return devices;
}
