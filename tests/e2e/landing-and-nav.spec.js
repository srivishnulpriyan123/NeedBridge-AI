import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Landing Page & Global Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('TC-LAND-01: Displays hero headline, subhead and AI platform badge', async ({ page }) => {
    // 1. Verify brand badge
    await expect(page.locator('text=AI-Driven Community Aid & Transparent Payment Gateway')).toBeVisible();

    // 2. Verify main hero heading
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('Connecting Critical Needs with Compassionate Donors');
    await expect(heroHeading).toContainText('Powered by AI.');

    // 3. Verify subhead description
    await expect(page.locator('text=NeedBridge AI bridges the gap')).toBeVisible();
  });

  test('TC-LAND-02: Hero CTA buttons navigate to correct portal destinations', async ({ page }) => {
    // Check "Explore Aid Requests" CTA
    const exploreBtn = page.getByRole('button', { name: /Explore Aid Requests/i });
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();
    await expect(page).toHaveURL(/\/donor/);

    // Return to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check "Audit Ledger" link
    const auditLink = page.getByRole('link', { name: /Audit Ledger/i });
    await expect(auditLink).toBeVisible();
    await auditLink.click();
    await expect(page).toHaveURL(/\/transparency/);
  });

  test('TC-LAND-03: Displays How It Works 4-step architecture cards', async ({ page }) => {
    // Verify 4-step workflow
    await expect(page.locator('text=How NeedBridge AI Works in 4 Simple Steps')).toBeVisible();
    await expect(page.locator('text=Beneficiary Submits Need')).toBeVisible();
    await expect(page.locator('text=AI Analyzes & Prioritizes')).toBeVisible();
    await expect(page.locator('text=Donors Support with PayPal')).toBeVisible();
    await expect(page.locator('text=Transparent Ledger Audit')).toBeVisible();
  });

  test('TC-LAND-04: Displays impact metrics and featured urgent aid requests', async ({ page }) => {
    // Verify impact counters section
    await expect(page.locator('text=Transparency, Efficiency & Real-Time Accountability')).toBeVisible();
    await expect(page.locator('text=Families & Seniors Assisted')).toBeVisible();
    await expect(page.locator('text=Aid Delivered to Vendors')).toBeVisible();

    // Verify urgent aid section
    await expect(page.locator('text=Needs Requiring Immediate Support')).toBeVisible();
  });

  test('TC-LAND-05: Global Navbar allows direct navigation across portals and login', async ({ page }) => {
    // Check brand in navbar
    const brand = page.locator('header').locator('text=NeedBridge').first();
    await expect(brand).toBeVisible();

    // Check navigation links
    await expect(page.locator('header a[href="/donor"]')).toBeVisible();
    await expect(page.locator('header a[href="/transparency"]')).toBeVisible();

    // Navigate to Login page via Sign In
    const signInBtn = page.locator('header').getByRole('link', { name: /Sign In/i });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-LAND-06: Footer renders platform links and transparency disclaimer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('NeedBridge AI');
    await expect(footer).toContainText('All rights reserved');
    await expect(footer).toContainText('Public Ledger & Proof');
  });
});
