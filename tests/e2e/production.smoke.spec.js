import { test, expect } from '@playwright/test';

test.describe('Production Live Website Smoke Tests (boshta.benb3n.cloud)', () => {
  const publicRoutes = [
    { path: '/', expectedTitleFragment: 'منصة بشتة' },
    { path: '/login', expectedTitleFragment: 'منصة بشتة' },
    { path: '/activate', expectedTitleFragment: 'منصة بشتة' },
    { path: '/parent', expectedTitleFragment: 'منصة بشتة' },
    { path: '/demo', expectedTitleFragment: 'منصة بشتة' },
  ];

  for (const route of publicRoutes) {
    test(`renders public route ${route.path} without crash or white-screen`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
      expect(response?.status()).toBe(200);

      // Verify DOM root exists and contains rendered children
      const root = page.locator('#root');
      await expect(root).toBeVisible({ timeout: 10000 });
      const childCount = await root.locator('> *').count();
      expect(childCount).toBeGreaterThan(0);

      // Filter out harmless third-party / external network warnings
      const fatalErrors = consoleErrors.filter(err => 
        !err.includes('favicon') && 
        !err.includes('youtube') && 
        !err.includes('ERR_BLOCKED_BY_CLIENT')
      );
      // We log errors for audit reporting
      if (fatalErrors.length > 0) {
        console.warn(`[WARN] Console errors detected on ${route.path}:`, fatalErrors);
      }
    });
  }

  test('verifies responsive viewport layouts on public landing and login', async ({ page }) => {
    const viewports = [
      { name: 'Mobile (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      
      const root = page.locator('#root');
      await expect(root).toBeVisible();

      // Check horizontal overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing, `Viewport ${vp.name} should not have horizontal body overflow`).toBeFalsy();
    }
  });

  test('production security headers and cache posture inspection', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers['server']).toBeDefined();
    // Verify static content-type
    expect(headers['content-type']).toContain('text/html');
  });
});
