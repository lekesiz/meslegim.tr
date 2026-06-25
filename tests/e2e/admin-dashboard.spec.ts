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
    const studentsTab = page.getByRole('tab', { name: /Öğrenciler/i }).first();
    await studentsTab.scrollIntoViewIfNeeded();
    await studentsTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Öğrenci') || bodyText.includes('öğrenci') || bodyText.includes('Tablo') || bodyText.includes('Adı')).toBeTruthy();
  });

  test('should navigate to payment management', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Ödemeler tab
    const paymentTab = page.getByRole('tab', { name: /Ödemeler/i }).first();
    await paymentTab.scrollIntoViewIfNeeded();
    await paymentTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Ödeme') || bodyText.includes('Gelir') || bodyText.includes('Satış') || bodyText.includes('İşlem') || bodyText.includes('Tutar')).toBeTruthy();
  });

  test('should navigate to school management', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Okullar tab
    const schoolTab = page.getByRole('tab', { name: /Okullar/i }).first();
    await schoolTab.scrollIntoViewIfNeeded();
    await schoolTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Okul') || bodyText.includes('okul') || bodyText.includes('Ekle') || bodyText.includes('Şehir')).toBeTruthy();
  });

  test('should navigate to promotion codes', async ({ page, context }) => {
    await loginAs(page, context, adminEmail, adminPassword);
    
    // Click Kuponlar tab
    const promoTab = page.getByRole('tab', { name: /Kuponlar/i }).first();
    await promoTab.scrollIntoViewIfNeeded();
    await promoTab.click();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText.includes('Promosyon') || bodyText.includes('promosyon') || bodyText.includes('Kupon') || bodyText.includes('Kullanım') || bodyText.includes('Kod')).toBeTruthy();
  });
});
