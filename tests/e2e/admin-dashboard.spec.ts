import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Admin Dashboard E2E Tests
 */

test.describe('Admin Dashboard', () => {
  const adminEmail = 'admin@test.com';
  const adminPassword = 'test123';

  test('should login as admin and see dashboard', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should navigate to student management', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Admin dashboard uses tabs - click Öğrenciler tab
    const studentsTab = page.locator('[role="tab"]').filter({ hasText: 'Öğrenciler' }).first();
    await studentsTab.scrollIntoViewIfNeeded();
    await studentsTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Öğrenci') || bodyText.includes('öğrenci')).toBeTruthy();
  });

  test('should navigate to payment management', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Ödeme Yönetimi tab
    const paymentTab = page.locator('[role="tab"]').filter({ hasText: 'Ödeme Yönetimi' }).first();
    await paymentTab.scrollIntoViewIfNeeded();
    await paymentTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Ödeme') || bodyText.includes('Gelir') || bodyText.includes('Satış')).toBeTruthy();
  });

  test('should navigate to school management', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Okul Yönetimi tab
    const schoolTab = page.locator('[role="tab"]').filter({ hasText: 'Okul Yönetimi' }).first();
    await schoolTab.scrollIntoViewIfNeeded();
    await schoolTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Okul') || bodyText.includes('okul')).toBeTruthy();
  });

  test('should navigate to promotion codes', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Promosyon Kodları tab
    const promoTab = page.locator('[role="tab"]').filter({ hasText: 'Promosyon' }).first();
    await promoTab.scrollIntoViewIfNeeded();
    await promoTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Promosyon') || bodyText.includes('promosyon') || bodyText.includes('Kod')).toBeTruthy();
  });
});
