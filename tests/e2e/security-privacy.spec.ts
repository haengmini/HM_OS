import { test, expect } from '@playwright/test';

test('purges legacy plaintext chat before PIN authentication', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hm-os-chat-preview', JSON.stringify([
      { id: 'legacy', role: 'user', content: 'synthetic private legacy message' },
    ]));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /HM OS/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'HM OS 기능' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('hm-os-chat-preview'))).toBeNull();
  await expect(page.getByText('synthetic private legacy message')).toHaveCount(0);
});
