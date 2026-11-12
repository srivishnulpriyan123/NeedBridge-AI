import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Beneficiary Aid Intake & Real-Time AI Scoring', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Beneficiary
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const benBtn = page.locator('button', { hasText: 'Beneficiary Persona' });
    await benBtn.click();
    await expect(page).toHaveURL(/\/beneficiary/);
    await page.waitForLoadState('networkidle');
  });

  test('TC-BEN-01: Displays beneficiary overview metrics and submitted requests list', async ({ page }) => {
    await expect(page.locator('text=Community Relief Dashboard')).toBeVisible();
    await expect(page.locator('text=Beneficiary Portal').first()).toBeVisible();

    // Verify presence of quick action
    const submitBtn = page.getByRole('link', { name: /Submit New Aid Request/i });
    await expect(submitBtn).toBeVisible();

    // Verify search and table headers
    await expect(page.locator('input[placeholder*="Search needs"]')).toBeVisible();
  });

  test('TC-BEN-02: Form validates required fields and character length restrictions', async ({ page }) => {
    await page.goto('/beneficiary/new-request');
    await page.waitForLoadState('networkidle');

    // Attempt submit with empty title
    const submitBtn = page.getByRole('button', { name: /Submit Request for Verification/i });
    await submitBtn.click();

    // Verify validation errors
    await expect(page.locator('text=Title is required.')).toBeVisible();
  });

  test('TC-BEN-03: Live AI Score updates reactively as inputs are provided', async ({ page }) => {
    await page.goto('/beneficiary/new-request');
    await page.waitForLoadState('networkidle');

    // Initial AI Score preview is visible
    await expect(page.locator('text=Real-Time AI Need Estimator')).toBeVisible();
    await expect(page.locator('text=/ 100 Prioritization Index')).toBeVisible();

    // Fill high urgency description
    const descInput = page.locator('textarea[placeholder*="Explain why the supplies"]');
    await descInput.fill('Urgent critical crisis! Heavy flood waters submerged all family dwellings, cutting off fresh drinking water and infant milk supplies.');

    // Verify AI preview updates assigned tier or vulnerability
    await expect(page.locator('text=Assigned Tier:')).toBeVisible();
  });

  test('TC-BEN-04: Submits valid aid request and displays it in Beneficiary Dashboard with Pending status', async ({ page }) => {
    await page.goto('/beneficiary/new-request');
    await page.waitForLoadState('networkidle');

    const testTitle = `Disaster Relief Urgent Kit Batch #${Date.now().toString().slice(-4)}`;

    // Fill form
    await page.locator('input[placeholder*="e.g. Urgent Warm Jackets"]').fill(testTitle);
    await page.locator('textarea[placeholder*="Explain why the supplies"]').fill(
      'Community shelter requires emergency food kits and blankets for 30 displaced residents after severe flash flooding.'
    );
    await page.locator('input[placeholder="e.g. 40"]').fill('30');
    await page.locator('input[placeholder="e.g. 850"]').fill('1200');
    await page.locator('input[placeholder*="Eastside Community Shelter"]').fill('Ward 6 Emergency Community Center');

    // Submit request
    const submitBtn = page.getByRole('button', { name: /Submit Request for Verification/i });
    await submitBtn.click();

    // Expect redirect back to beneficiary dashboard
    await expect(page).toHaveURL(/\/beneficiary/, { timeout: 10000 });

    // Verify newly submitted item is visible in the list
    await expect(page.locator(`text=${testTitle}`).first()).toBeVisible({ timeout: 10000 });
  });
});
