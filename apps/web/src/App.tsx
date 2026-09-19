import { AuthGate } from './features/auth/AuthGate.js';
import { PixelOffice } from './features/office/PixelOffice.js';
import './styles/office.css';

/**
 * Milestone 3: the auth gate now wraps the real pixel office (not the
 * Milestone 1 placeholder shell). Milestone 4 adds terminal/file
 * panels alongside PixelOffice.
 */
export function App() {
  return (
    <AuthGate>
      <PixelOffice />
    </AuthGate>
  );
}
