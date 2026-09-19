import { useEffect, useState } from 'react';
import { onUpdateAvailable } from './swUpdates.js';

/**
 * Small dismissible-by-action banner shown when the service worker
 * has a new version ready. Rendered unconditionally in App.tsx; it
 * renders nothing until registerSW.ts's onNeedRefresh fires.
 */
export function UpdateBanner() {
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);

  useEffect(() => {
    onUpdateAvailable((apply) => setApplyUpdate(() => apply));
  }, []);

  if (!applyUpdate) return null;

  return (
    <div className="hm-os-update-banner" role="status">
      <span>새 버전이 준비되었습니다.</span>
      <button type="button" onClick={() => applyUpdate()}>
        새로고침
      </button>
    </div>
  );
}
