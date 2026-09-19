import { registerSW } from 'virtual:pwa-register';
import { notifyUpdateAvailable } from './features/pwa/swUpdates.js';

/** Registers the production service worker and exposes updates to UI. */
export function initServiceWorker() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      notifyUpdateAvailable(() => updateSW(true));
    },
    onOfflineReady() {
      // The cached app shell is ready; server-backed controls remain online-only.
    },
  });
}
