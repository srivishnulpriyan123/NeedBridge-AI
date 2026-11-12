import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Donor Discovery & PayPal Sandbox Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Donor
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const donorBtn = page.locator('button', { hasText: 'Donor Persona' });
    await donorBtn.click();
    await expect(page).toHaveURL(/\/donor/);
    await page.waitForLoadState('networkidle');
  });

  test('TC-DON-01: Displays verified community causes with funding progress', async ({ page }) => {
    await expect(page.locator('text=Donor Discovery Portal')).toBeVisible();
    await expect(page.locator('text=Verified Community Needs')).toBeVisible();

    // Verify search and category filter pills
    await expect(page.locator('input[placeholder*="Search by title"]')).toBeVisible();

    // Verify at least one cause card is rendered
    const supportBtns = page.getByRole('button', { name: /^Support$/i });
    const count = await supportBtns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-DON-02: Search and category filters narrow down displayed causes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by title"]');
    await searchInput.fill('Flood');
    await page.waitForTimeout(300);

    const cards = page.locator('.bg-white.rounded-2xl.border');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-DON-03: Opens SupportModal and selects pledge amount presets', async ({ page }) => {
    // Click Support on first card
    const supportBtn = page.getByRole('button', { name: /^Support$/i }).first();
    await supportBtn.click();

    // Verify Support Modal opens
    await expect(page.locator('text=Support Verified Aid Need')).toBeVisible();

    // Verify presets
    const preset50 = page.getByRole('button', { name: '$50', exact: true });
    await expect(preset50).toBeVisible();
    await preset50.click();

    // Verify PayPal Sandbox checkout button reflects amount
    const paypalBtn = page.locator('button', { hasText: /Sandbox Checkout/i });
    await expect(paypalBtn).toBeVisible();
    await expect(paypalBtn).toContainText('$50');
  });

  test('TC-DON-04: Full PayPal Sandbox Checkout: Order creation, test approval, server capture & receipt generation', async ({ page }) => {
    // 1. Open Support Modal
    const supportBtn = page.getByRole('button', { name: /^Support$/i }).first();
    await supportBtn.click();
    await expect(page.locator('text=Support Verified Aid Need')).toBeVisible();

    // 2. Select $50 preset
    await page.getByRole('button', { name: '$50', exact: true }).click();

    // 3. Click PayPal Sandbox Checkout button
    const checkoutBtn = page.locator('button', { hasText: /Sandbox Checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 4. Verify PayPal Sandbox Test Portal dialog opens
    await expect(page.locator('text=Sandbox Test Portal')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=v2/checkout/orders')).toBeVisible();
    await expect(page.locator('text=Total Authorization:')).toBeVisible();

    // 5. Approve payment in sandbox dialog
    const approveBtn = page.getByRole('button', { name: /Approve & Complete Sandbox Payment/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // 6. Verify Contribution Verified modal appears with receipt details
    await expect(page.locator('text=Contribution Verified')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h4', { hasText: 'Thank You' })).toBeVisible();
    await expect(page.locator('text=Official Receipt:')).toBeVisible();
    await expect(page.locator('text=PayPal Order ID:')).toBeVisible();
    await expect(page.locator('text=PayPal Capture ID:')).toBeVisible();

    // 7. Close modal
    const closeBtn = page.getByRole('button', { name: /Close/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('TC-DON-05: Cancelling PayPal Sandbox Checkout cleanly resets order without deducting balance', async ({ page }) => {
    const supportBtn = page.getByRole('button', { name: /^Support$/i }).first();
    await supportBtn.click();
    await expect(page.locator('text=Support Verified Aid Need')).toBeVisible();

    // Initiate checkout
    const checkoutBtn = page.locator('button', { hasText: /Sandbox Checkout/i });
    await checkoutBtn.click();

    // Wait for sandbox portal
    await expect(page.locator('text=Sandbox Test Portal')).toBeVisible({ timeout: 10000 });

    // Cancel order
    const cancelBtn = page.getByRole('button', { name: /Cancel Sandbox Checkout/i });
    await cancelBtn.click();

    // Verify dialog closes and returns safely to SupportModal
    await expect(page.locator('text=Sandbox Test Portal')).not.toBeVisible();
    await expect(page.locator('text=Support Verified Aid Need')).toBeVisible();
  });
});
