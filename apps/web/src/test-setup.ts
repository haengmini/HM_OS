import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// vitest.config.ts does not set `test.globals: true`, so
// @testing-library/react's automatic afterEach(cleanup) (which checks
// for a global `afterEach`) never registers. Do it explicitly so each
// test starts from an empty DOM.
afterEach(() => {
  cleanup();
});
