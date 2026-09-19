import type { OfficeState } from '@hm-os/contracts';

/**
 * Milestone 0 placeholder shell. Milestone 1 replaces the root render
 * with the auth/lock-screen gate; Milestone 3 adds the real pixel
 * office canvas. This file exists so the workspace builds and has a
 * single shared type import wired end-to-end from packages/contracts.
 */
const placeholderState: OfficeState = 'idle';

export function App() {
  return (
    <main>
      <h1>HM OS</h1>
      <p>Milestone 0 scaffold — office state placeholder: {placeholderState}</p>
    </main>
  );
}
