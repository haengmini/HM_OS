import { AuthGate } from './features/auth/AuthGate.js';
import { PixelOffice } from './features/office/PixelOffice.js';
import { UpdateBanner } from './features/pwa/UpdateBanner.js';
import './styles/office.css';

/**
 * Milestone 3: the auth gate wraps the real pixel office.
 * Milestone 5: UpdateBanner renders unconditionally above the gate so
 * a "new version ready" prompt from the PWA service worker is visible
 * even on the lock screen, not just once inside the office.
 */
export function App() {
  return (
    <>
      <UpdateBanner />
      <AuthGate>
        <PixelOffice />
      </AuthGate>
    </>
  );
}
