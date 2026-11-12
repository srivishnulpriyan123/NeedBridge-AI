import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Cross-Device Responsive Layouts & Mobile Navigation', () => {
  const viewports = [
    { name: 'Desktop Full HD', width: 1920, height: 1080, isMobile: false },
    { name: 'Standard Laptop', width: 1366, height: 768, isMobile: false },
    { name: 'iPad / Tablet Portrait', width: 768, height: 1024, isMobile: true },
    { name: 'Mobile Smartphone', width: 390, height: 844, isMobile: true }
  ];

  for (const vp of viewports) {
    test(`TC-RESP-${vp.width}: Renders Landing Page cleanly without horizontal overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 1. Verify brand is visible
      await expect(page.locator('text=NeedBridge').first()).toBeVisible();

      // 2. Check for unexpected horizontal scrolling/overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance for subpixel antialiasing

      // 3. If mobile/tablet, test mobile hamburger menu
      if (vp.isMobile) {
        const menuBtn = page.locator('header button[aria-label="Toggle navigation"]');
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(200);
          // Verify mobile drawer items
          await expect(page.locator('text=Explore Aid Needs').last()).toBeVisible();
          await expect(page.locator('text=Transparency Ledger').last()).toBeVisible();
          // Close menu
          await menuBtn.click();
        }
      }
    });

    test(`TC-RESP-${vp.width}-DONOR: Renders Donor Discovery Portal cleanly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/donor');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Verified Community Needs')).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });

    test(`TC-RESP-${vp.width}-TRANS: Renders Public Transparency Ledger cleanly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/transparency');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Transparent Financial Audit & Orders')).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }
});
