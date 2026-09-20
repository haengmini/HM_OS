import type { DeviceProfileId } from '@hm-os/contracts';
import { DEVICE_OPTIONS, suggestedDevice } from './useDevicePresence.js';

export function DeviceSetup({ onSelect }: { onSelect: (id: DeviceProfileId) => void }) {
  const suggested = suggestedDevice();
  return (
    <div className="hm-os-device-setup" role="dialog" aria-modal="true" aria-labelledby="device-setup-title">
      <div className="hm-os-device-setup-card">
        <span className="hm-os-device-setup-kicker">CREATE YOUR COLONIST</span>
        <h2 id="device-setup-title">이 기기의 캐릭터를 선택하세요</h2>
        <p>선택은 이 기기에만 저장되며, 접속 중인 장비가 콜로니 맵에 각각 표시됩니다.</p>
        <div className="hm-os-device-options">
          {DEVICE_OPTIONS.map((option) => (
            <button key={option.id} type="button" data-suggested={option.id === suggested} onClick={() => onSelect(option.id)}>
              <span className={`hm-os-device-avatar device-${option.id}`} aria-hidden="true">{option.icon}</span>
              <b>{option.label}</b>
              {option.id === suggested && <small>추천</small>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
