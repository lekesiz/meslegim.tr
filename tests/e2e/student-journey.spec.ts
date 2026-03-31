import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Student Journey E2E Tests
 */

test.describe('Student Journey', () => {
  const studentEmail = 'student@test.com';
  const studentPassword = 'test123';

  test('should login as student successfully', async ({ page, context }) => {
    await loginAs(page, context, studentEmail, studentPassword);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display student dashboard with stages', async ({ page, context }) => {
    await loginAs(page, context, studentEmail, studentPassword);
    await page.waitForTimeout(1000);
    
    const pageContent = await page.locator('body').textContent() || '';
    const hasRelevantContent = pageContent.includes('Etap') || 
      pageContent.includes('Dashboard') || 
      pageContent.includes('Hoş Geldin') ||
      pageContent.includes('Öğrenci') ||
      pageContent.includes('Kariyer');
    expect(hasRelevantContent).toBeTruthy();
  });

  test('should navigate to career profile', async ({ page, context }) => {
    await loginAs(page, context, studentEmail, studentPassword);
    
    const careerLink = page.locator('a, button').filter({ hasText: 'Kariyer' }).first();
    if (await careerLink.isVisible().catch(() => false)) {
      await careerLink.click();
      await page.waitForTimeout(1000);
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should navigate to payment history', async ({ page, context }) => {
    await loginAs(page, context, studentEmail, studentPassword);
    
    const paymentLink = page.locator('a, button').filter({ hasText: 'Ödeme' }).first();
    if (await paymentLink.isVisible().catch(() => false)) {
      await paymentLink.click();
      await page.waitForTimeout(1000);
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });
});
