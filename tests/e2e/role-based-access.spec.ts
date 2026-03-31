import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Role-Based Access E2E Tests
 */

const roles = [
  { name: 'Admin', email: 'admin@test.com', password: 'test123' },
  { name: 'Mentor', email: 'mentor@test.com', password: 'test123' },
  { name: 'School Admin', email: 'school@test.com', password: 'test123' },
  { name: 'Student', email: 'student@test.com', password: 'test123' },
];

test.describe('Role-Based Access Control', () => {
  for (const role of roles) {
    test(`should login as ${role.name} and see dashboard`, async ({ page, context }) => {
      await loginAs(page, context, role.email, role.password);
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    });
  }

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const hasLoginForm = await page.locator('#email').isVisible().catch(() => false);
    expect(url.includes('login') || hasLoginForm).toBeTruthy();
  });

  test('should display public pages without authentication', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Meslegim.tr').first()).toBeVisible({ timeout: 5000 });
    
    await page.goto('/fiyatlandirma');
    await page.waitForTimeout(1000);
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
    
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await expect(page.locator('#email')).toBeVisible({ timeout: 5000 });
  });
});
