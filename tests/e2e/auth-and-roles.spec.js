import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Authentication, Role-Based Access Control & Navigation Guards', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test for a clean auth slate
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('TC-AUTH-01: Login page presents 1-click persona buttons and email/password inputs', async ({ page }) => {
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('text=1-Click Demo Evaluation Roles')).toBeVisible();

    // Verify 1-click demo persona cards
    await expect(page.locator('text=Donor Persona')).toBeVisible();
    await expect(page.locator('text=Beneficiary Persona')).toBeVisible();
    await expect(page.locator('text=Admin Auditor')).toBeVisible();

    // Verify manual inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('TC-AUTH-02: Form validation catches empty or invalid email and short password', async ({ page }) => {
    // Click submit empty
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Please provide a valid email address.')).toBeVisible();

    // Fill valid email but short password
    await page.locator('input[type="email"]').fill('test@needbridge.org');
    await page.locator('input[type="password"]').fill('123');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Password must be at least 6 characters.')).toBeVisible();
  });

  test('TC-AUTH-03: 1-Click Quick Demo Sign-in for Beneficiary lands on Beneficiary Dashboard', async ({ page }) => {
    const benBtn = page.locator('button', { hasText: 'Beneficiary Persona' });
    await benBtn.click();

    // Wait for redirect to beneficiary portal
    await expect(page).toHaveURL(/\/beneficiary/);
    await expect(page.locator('text=Beneficiary Portal').first()).toBeVisible();
    await expect(page.locator('text=Community Relief Dashboard')).toBeVisible();

    // Verify token stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('needbridge_token'));
    expect(token).toBeTruthy();
  });

  test('TC-AUTH-04: 1-Click Quick Demo Sign-in for Donor lands on Donor Discovery Portal', async ({ page }) => {
    const donorBtn = page.locator('button', { hasText: 'Donor Persona' });
    await donorBtn.click();

    // Wait for redirect to donor portal
    await expect(page).toHaveURL(/\/donor/);
    await expect(page.locator('text=Donor Discovery Portal')).toBeVisible();
    await expect(page.locator('text=Verified Community Needs')).toBeVisible();
  });

  test('TC-AUTH-05: 1-Click Quick Demo Sign-in for Admin lands on Auditor Queue', async ({ page }) => {
    const adminBtn = page.locator('button', { hasText: 'Admin Auditor' });
    await adminBtn.click();

    // Wait for redirect to admin portal
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Aid Intake & Verification Queue')).toBeVisible();
    await expect(page.locator('text=Auditor Clearance Level 3')).toBeVisible();
  });

  test('TC-AUTH-06: Manual authentication succeeds with verified credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('dr.jane@healthtrust.org');
    await page.locator('input[type="password"]').fill('DonorPass123!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/donor/);
    await expect(page.locator('header').locator('text=Dr. Jane Chen')).toBeVisible();
  });

  test('TC-AUTH-07: Invalid credentials display error alert and remain on login', async ({ page }) => {
    await page.locator('input[type="email"]').fill('wrong@user.org');
    await page.locator('input[type="password"]').fill('InvalidPassword999!');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Invalid email or password').first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-08: User can log out safely from navbar dropdown', async ({ page }) => {
    // Login as Admin
    await page.locator('button', { hasText: 'Admin Auditor' }).click();
    await expect(page).toHaveURL(/\/admin/);

    // Open user dropdown in navbar
    const profileBtn = page.locator('header button', { hasText: 'Sarah Al-Mansoor' });
    await profileBtn.click();

    // Click Sign Out
    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify redirected to login and token removed
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('needbridge_token'));
    expect(token).toBeNull();
  });
});
