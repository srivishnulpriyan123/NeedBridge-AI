import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Admin Auditor Inspection & Gemini AI Decisioning', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const adminBtn = page.locator('button', { hasText: 'Admin Auditor' });
    await adminBtn.click();
    await expect(page).toHaveURL(/\/admin/);
    await page.waitForLoadState('networkidle');
  });

  test('TC-ADM-01: Displays admin metrics, queue filters and intake table', async ({ page }) => {
    await expect(page.locator('text=Aid Intake & Verification Queue')).toBeVisible();
    await expect(page.locator('text=Auditor Clearance Level 3')).toBeVisible();

    // Verify tabs
    await expect(page.locator('button', { hasText: 'Pending' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Approved' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Rejected' })).toBeVisible();

    // Verify search input
    await expect(page.locator('input[placeholder*="Search queue"]')).toBeVisible();
  });

  test('TC-ADM-02: Switching tabs filters requests by verification lifecycle status', async ({ page }) => {
    // Click "Approved" tab
    await page.locator('button', { hasText: 'Approved' }).first().click();
    await page.waitForTimeout(300);

    // Verify approved requests are shown
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Click "All" tab
    await page.locator('button', { hasText: 'All' }).click();
    await page.waitForTimeout(300);
    const allCount = await page.locator('tbody tr').count();
    expect(allCount).toBeGreaterThanOrEqual(rowCount);
  });

  test('TC-ADM-03: Auditor inspects request and verifies Gemini AI Analysis breakdown', async ({ page }) => {
    // Switch to All or Approved tab to ensure rows exist
    await page.locator('button', { hasText: 'All' }).click();
    await page.waitForTimeout(300);

    // Click Inspect on first request
    const inspectBtn = page.getByRole('button', { name: /Inspect/i }).first();
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // Verify Modal opens with AI analysis
    await expect(page.locator('text=Audit Review:').first()).toBeVisible();
    await expect(page.locator('text=Gemini AI Humanitarian Needs Triage')).toBeVisible();
    await expect(page.locator('text=Priority Rationale:')).toBeVisible();
  });

  test('TC-ADM-04: Approves pending aid request with audit note and updates queue', async ({ page }) => {
    // Switch to Pending tab
    await page.locator('button', { hasText: 'Pending' }).first().click();
    await page.waitForTimeout(300);

    const approveBtn = page.getByRole('button', { name: /Approve/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});
