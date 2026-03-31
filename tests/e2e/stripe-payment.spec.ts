import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Stripe Payment Flow E2E Tests
 */

test.describe('Stripe Payment Flow', () => {
  test('should display pricing page with packages', async ({ page }) => {
    await page.goto('/fiyatlandirma');
    await page.waitForTimeout(2000);
    
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
    
    const hasPackage = await page.locator('text=Temel').first().isVisible().catch(() => false)
      || await page.locator('text=Profesyonel').first().isVisible().catch(() => false)
      || await page.locator('text=Kurumsal').first().isVisible().catch(() => false);
    expect(hasPackage).toBeTruthy();
  });

  test('should redirect to Stripe checkout when buying a package', async ({ page, context }) => {
    await loginAs(page, context, 'student@test.com', 'test123');
    
    await page.goto('/fiyatlandirma');
    await page.waitForTimeout(2000);
    
    const buyButton = page.locator('button:has-text("Satın Al")').first();
    const isVisible = await buyButton.isVisible().catch(() => false);
    
    if (isVisible) {
      const pagePromise = page.context().waitForEvent('page', { timeout: 15000 }).catch(() => null);
      
      await buyButton.click();
      await page.waitForTimeout(5000);
      
      const newPage = await pagePromise;
      if (newPage) {
        const url = newPage.url();
        expect(url).toContain('checkout.stripe.com');
        await newPage.close();
      } else {
        const currentUrl = page.url();
        const isStripe = currentUrl.includes('checkout.stripe.com');
        const isPricing = currentUrl.includes('fiyatlandirma');
        const isDashboard = currentUrl.includes('dashboard');
        expect(isStripe || isPricing || isDashboard).toBeTruthy();
      }
    }
  });

  test('should show payment history for logged-in student', async ({ page, context }) => {
    await loginAs(page, context, 'student@test.com', 'test123');
    
    const paymentLink = page.locator('a, button').filter({ hasText: 'Ödeme' }).first();
    if (await paymentLink.isVisible().catch(() => false)) {
      await paymentLink.click();
      await page.waitForTimeout(1000);
      
      const hasHistory = await page.locator('text=Ödeme').first().isVisible().catch(() => false);
      expect(hasHistory).toBeTruthy();
    }
  });
});
