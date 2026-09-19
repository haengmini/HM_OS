import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../../tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8780',
    extraHTTPHeaders: { 'Tailscale-User-Login': 'ihyeongmin00@gmail.com' },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: "cd ../.. && rm -rf /tmp/hm-os-e2e-data /tmp/hm-os-e2e-files && mkdir -p /tmp/hm-os-e2e-files && printf 'initial e2e content' > /tmp/hm-os-e2e-files/e2e.txt && HM_OS_OWNER_LOGIN='ihyeongmin00@gmail.com' HM_OS_TAILNET_HOSTNAME='127.0.0.1:8780' HM_OS_DATA_DIR=/tmp/hm-os-e2e-data HM_OS_FILES_ROOT=/tmp/hm-os-e2e-files HM_OS_TERMINAL_CWD=/tmp/hm-os-e2e-files HM_OS_COOKIE_SECURE=false PORT=8780 node apps/api/dist/server.js",
    url: 'http://127.0.0.1:8780/healthz',
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
