import { defineConfig } from '@playwright/test';

/**
 * Milestone 0: placeholder config so `npm run test:e2e` resolves.
 * Real specs land starting Milestone 3 (office UI) and Milestone 4
 * (terminal/files control loop).
 */
export default defineConfig({
  testDir: '../../tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
  },
});
