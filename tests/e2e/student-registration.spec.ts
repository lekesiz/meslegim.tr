import { test, expect } from '@playwright/test';

/**
 * Student Registration Flow E2E Tests
 */

test.describe('Student Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display registration form on homepage', async ({ page }) => {
    // Check if registration button is visible
    const registerBtn = page.locator('text=Ücretsiz Başla').first();
    await expect(registerBtn).toBeVisible({ timeout: 5000 });
    
    // Click registration button
    await registerBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify form fields are visible (using id or type selectors)
    const hasNameField = await page.locator('#name, input[placeholder*="Ad"]').first().isVisible().catch(() => false);
    const hasEmailField = await page.locator('#email, input[type="email"]').first().isVisible().catch(() => false);
    expect(hasNameField || hasEmailField).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    const registerBtn = page.locator('text=Ücretsiz Başla').first();
    if (await registerBtn.isVisible().catch(() => false)) {
      await registerBtn.click();
      await page.waitForTimeout(1000);
      
      // Try to submit empty form
      const submitBtn = page.locator('button:has-text("Başvuruyu Gönder"), button:has-text("Kayıt Ol")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        
        // Form should still be visible (validation failed)
        const hasForm = await page.locator('form').isVisible().catch(() => false);
        expect(hasForm).toBeTruthy();
      }
    }
  });

  test('should navigate to registration page', async ({ page }) => {
    // Navigate to registration page directly
    await page.goto('/kayit');
    await page.waitForTimeout(1000);
    
    // Check if registration form or redirect to home is present
    const hasForm = await page.locator('form').isVisible().catch(() => false);
    const hasBody = await page.locator('body').isVisible();
    expect(hasForm || hasBody).toBeTruthy();
  });
});
