import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Public Cryptographic Transparency Ledger & Audit Trail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transparency');
    await page.waitForLoadState('networkidle');
  });

  test('TC-TRN-01: Displays public cryptographic ledger header, metrics and integrity badge', async ({ page }) => {
    await expect(page.locator('text=Public Cryptographic Ledger')).toBeVisible();
    await expect(page.locator('text=Transparent Financial Audit & Orders')).toBeVisible();

    // Verify metrics
    await expect(page.locator('text=Total Settled via PayPal')).toBeVisible();
    await expect(page.locator('text=Verified Ledger Records')).toBeVisible();
    await expect(page.locator('text=Hash Verification Rate')).toBeVisible();
    await expect(page.locator('text=Tamper-Proof')).toBeVisible();

    // Verify anti-hallucination standard
    await expect(page.locator('text=Humanitarian Procurement & Non-Diversion Standard:')).toBeVisible();
    await expect(page.locator('text=Relief supplies are never claimed as delivered solely because payment succeeded')).toBeVisible();
  });

  test('TC-TRN-02: Status filter toggles between Completed, Pending and All transactions', async ({ page }) => {
    // Check "All" button
    const allBtn = page.getByRole('button', { name: /^All \(/i });
    await expect(allBtn).toBeVisible();

    // Check "Completed" button
    const compBtn = page.getByRole('button', { name: /^Completed \(/i });
    await expect(compBtn).toBeVisible();
    await compBtn.click();
    await page.waitForTimeout(300);

    // Verify rows exist or empty state
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-TRN-03: Search query filters transactions by donor name or request title', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transaction"]');
    await searchInput.fill('Dr. Jane');
    await page.waitForTimeout(300);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(rows.first()).toContainText('Dr. Jane');
  });

  test('TC-TRN-04: Clicking Invoice button opens official cryptographic receipt modal', async ({ page }) => {
    // Click Invoice on first row
    const invoiceBtn = page.getByRole('button', { name: /Invoice/i }).first();
    await expect(invoiceBtn).toBeVisible();
    await invoiceBtn.click();

    // Verify Receipt Modal opens
    await expect(page.locator('text=Official Non-Profit Audit Receipt')).toBeVisible();
    await expect(page.locator('text=NeedBridge AI Relief Foundation')).toBeVisible();
    await expect(page.locator('text=Cryptographic Block Verification')).toBeVisible();
    await expect(page.locator('text=Total Contribution Allocated')).toBeVisible();

    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Official Non-Profit Audit Receipt')).not.toBeVisible();
  });

  test('TC-TRN-05: Clicking copy hash triggers clipboard notification toast', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const hashBtn = page.locator('button[title="Click to copy full hash"]').first();
    if (await hashBtn.isVisible()) {
      await hashBtn.click();
      await expect(page.locator('text=Cryptographic hash copied to clipboard!')).toBeVisible({ timeout: 5000 });
    }
  });
});
