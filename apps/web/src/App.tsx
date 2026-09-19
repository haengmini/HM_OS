import type { OfficeState } from '@hm-os/contracts';
import { AuthGate } from './features/auth/AuthGate.js';

/**
 * Milestone 1: real auth gate wraps a still-placeholder app shell.
 * Milestone 3 replaces the placeholder below with the pixel office
 * canvas; Milestone 4 adds terminal/file panels alongside it.
 */
const placeholderState: OfficeState = 'idle';

function AuthenticatedShell() {
  return (
    <main>
      <h1>HM OS</h1>
      <p>Milestone 1 scaffold — office state placeholder: {placeholderState}</p>
    </main>
  );
}

export function App() {
  return (
    <AuthGate>
      <AuthenticatedShell />
    </AuthGate>
  );
}
