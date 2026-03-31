import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

/**
 * Dark Mode & Responsive E2E Tests
 */

test.describe('Dark Mode', () => {
  test('should toggle dark mode on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Get initial state
    const htmlBefore = await page.locator('html').getAttribute('class');
    
    // Toggle dark mode via localStorage
    await page.evaluate(() => {
      const current = localStorage.getItem('theme');
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const htmlAfter = await page.locator('html').getAttribute('class');
    expect(htmlAfter).not.toBe(htmlBefore);
  });

  test('should persist dark mode preference', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const htmlClass = await page.locator('html').getAttribute('class') || '';
    expect(htmlClass).toContain('dark');
  });

  test('should render pricing page in dark mode', async ({ page }) => {
    await page.goto('/fiyatlandirma');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    const htmlClass = await page.locator('html').getAttribute('class') || '';
    expect(htmlClass).toContain('dark');
    
    // Page content should be visible
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('should render login page in dark mode', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify login form is visible using id selector
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    
    const htmlClass = await page.locator('html').getAttribute('class') || '';
    expect(htmlClass).toContain('dark');
  });
});

test.describe('Responsive Layout', () => {
  test('should display homepage on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display pricing page on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/fiyatlandirma');
    await page.waitForTimeout(2000);
    
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('should display login form on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // Use id selector instead of name
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Giriş Yap")')).toBeVisible();
  });

  test('should display dashboard on mobile after login', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // Use evaluate to set React controlled input values
    await page.evaluate(() => {
      function setNativeValue(el: HTMLInputElement, val: string) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        setter?.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const emailEl = document.querySelector('#email') as HTMLInputElement;
      const pwdEl = document.querySelector('#password') as HTMLInputElement;
      if (emailEl) setNativeValue(emailEl, 'admin@test.com');
      if (pwdEl) setNativeValue(pwdEl, 'test123');
    });
    await page.waitForTimeout(300);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display homepage on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Meslegim.tr').first()).toBeVisible({ timeout: 5000 });
  });
});
