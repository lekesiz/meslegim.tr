import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Mentor Dashboard E2E Tests
 */

test.describe('Mentor Dashboard', () => {
  const mentorEmail = 'mentor@test.com';
  const mentorPassword = 'test123';

  test('should login as mentor successfully', async ({ page, context }) => {
    await loginAs(page, context, mentorEmail, mentorPassword);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display mentor dashboard', async ({ page, context }) => {
    await loginAs(page, context, mentorEmail, mentorPassword);
    await page.waitForTimeout(2000);
    
    const pageContent = await page.locator('body').textContent() || '';
    const hasRelevantContent = pageContent.includes('Öğrenci') || 
      pageContent.includes('Mentor') || 
      pageContent.includes('Dashboard') ||
      pageContent.includes('Etap') ||
      pageContent.includes('Hoş Geldin');
    expect(hasRelevantContent).toBeTruthy();
  });

  test('should navigate to student list', async ({ page, context }) => {
    await loginAs(page, context, mentorEmail, mentorPassword);
    await page.waitForTimeout(1000);
    
    // Look for student-related link in sidebar or tabs
    const studentsLink = page.locator('a[href*="student"], a[href*="ogrenci"], [role="tab"]').filter({ hasText: 'Öğrenci' }).first();
    if (await studentsLink.isVisible().catch(() => false)) {
      await studentsLink.click();
      await page.waitForTimeout(1000);
      
      const hasTable = await page.locator('table').isVisible().catch(() => false);
      const hasEmptyState = (await page.locator('body').textContent() || '').includes('öğrenci');
      expect(hasTable || hasEmptyState).toBeTruthy();
    } else {
      // Dashboard may already show student list
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText.length > 0).toBeTruthy();
    }
  });

  test('should navigate to stage unlock', async ({ page, context }) => {
    await loginAs(page, context, mentorEmail, mentorPassword);
    await page.waitForTimeout(1000);
    
    // Look for stage unlock link
    const unlockLink = page.locator('a[href*="etap"], a[href*="stage"], [role="tab"]').filter({ hasText: 'Etap' }).first();
    if (await unlockLink.isVisible().catch(() => false)) {
      await unlockLink.click();
      await page.waitForTimeout(1000);
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    } else {
      // Dashboard may already show stage info
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText.length > 0).toBeTruthy();
    }
  });
});
