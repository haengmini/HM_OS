import { test, expect } from '@playwright/test';

const PIN = '246810';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/');
  const heading = page.locator('h1');
  await expect(heading).toContainText(/HM OS/);

  if (await page.getByLabel('PIN 확인').isVisible().catch(() => false)) {
    await page.getByLabel('PIN', { exact: true }).fill(PIN);
    await page.getByLabel('PIN 확인').fill(PIN);
    await page.getByRole('button', { name: 'PIN 설정' }).click();
  } else if (await page.getByLabel('PIN', { exact: true }).isVisible().catch(() => false)) {
    await page.getByLabel('PIN', { exact: true }).fill(PIN);
    await page.getByRole('button', { name: /로그인|잠금 해제/ }).click();
  }
  await expect(page.getByRole('navigation', { name: 'HM OS 기능' })).toBeVisible();
}

test('authenticates and renders the real pixel-office rooms', async ({ page }) => {
  await authenticate(page);
  for (const room of ['관제실', '에이전트 작업실', '도서관', '프로젝트룸']) {
    await expect(page.getByText(room, { exact: true })).toBeVisible();
  }
});

test('opens a real PTY terminal and file editor', async ({ page }) => {
  await authenticate(page);

  await page.getByRole('button', { name: '터미널' }).click();
  const terminalRegion = page.getByRole('region', { name: '서버 터미널' });
  await expect(terminalRegion).toBeVisible();
  await expect(terminalRegion.getByText('연결됨', { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: '파일' }).click();
  await expect(page.getByRole('region', { name: '파일 탐색기' })).toBeVisible();
  await page.getByRole('button', { name: /e2e\.txt/ }).first().click();
  const editor = page.locator('.hm-os-file-editor textarea');
  await expect(editor).not.toHaveValue('');
  await editor.fill('updated by HM OS browser E2E');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByText('저장됨')).toBeVisible();
});

test('publishes an installable PWA shell', async ({ page, request }) => {
  await authenticate(page);
  const manifest = await request.get('/manifest.webmanifest', {
    headers: { 'Tailscale-User-Login': 'ihyeongmin00@gmail.com' },
  });
  expect(manifest.ok()).toBeTruthy();
  const body = await manifest.json();
  expect(body.name).toBe('HM OS');
  expect(body.display).toBe('standalone');
  expect(body.icons).toHaveLength(3);

  const sw = await request.get('/sw.js', {
    headers: { 'Tailscale-User-Login': 'ihyeongmin00@gmail.com' },
  });
  expect(sw.ok()).toBeTruthy();
  expect((await sw.text()).length).toBeGreaterThan(500);
});
