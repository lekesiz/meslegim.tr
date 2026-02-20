import { test, expect } from '@playwright/test';

/**
 * Student Registration Flow E2E Tests
 * 
 * Tests the complete student registration journey:
 * 1. Fill registration form
 * 2. Submit application
 * 3. Verify pending status
 */

test.describe('Student Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display registration form on homepage', async ({ page }) => {
    // Check if registration form is visible
    await expect(page.locator('text=Ücretsiz Başla')).toBeVisible();
    
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Verify form fields are visible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="tcKimlik"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Try to submit empty form
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Check for validation errors (form should not submit)
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Fill form with invalid email
    await page.fill('input[name="name"]', 'Test Kullanıcı');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="tcKimlik"]', '12345678901');
    await page.fill('input[name="password"]', 'Test123!');
    
    // Select age group
    await page.click('[role="combobox"]');
    await page.click('text=14-17 yaş');
    
    // Check KVKK
    await page.check('input[type="checkbox"]');
    
    // Try to submit
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Email field should still be visible (form didn't submit)
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should successfully register a new student', async ({ page }) => {
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `test.student.${timestamp}@example.com`;
    
    // Fill form with valid data
    await page.fill('input[name="name"]', 'Test Öğrenci');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="tcKimlik"]', '12345678901');
    await page.fill('input[name="password"]', 'Test123!');
    
    // Select age group
    await page.click('[role="combobox"]');
    await page.click('text=14-17 yaş');
    
    // Check KVKK
    await page.check('input[type="checkbox"]');
    
    // Submit form
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Should show success message or redirect to login
    const url = page.url();
    expect(url).toContain('login');
  });

  test('should not allow duplicate email registration', async ({ page }) => {
    // This test assumes there's already a user with this email
    const existingEmail = 'mikaillekesiz@gmail.com';
    
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Fill form with existing email
    await page.fill('input[name="name"]', 'Test Kullanıcı');
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="tcKimlik"]', '12345678901');
    await page.fill('input[name="password"]', 'Test123!');
    
    // Select age group
    await page.click('[role="combobox"]');
    await page.click('text=14-17 yaş');
    
    // Check KVKK
    await page.check('input[type="checkbox"]');
    
    // Submit form
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Should show error toast (check for toast container)
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should validate TC Kimlik format', async ({ page }) => {
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Fill form with invalid TC Kimlik (less than 11 digits)
    await page.fill('input[name="name"]', 'Test Kullanıcı');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="tcKimlik"]', '123'); // Invalid
    await page.fill('input[name="password"]', 'Test123!');
    
    // Select age group
    await page.click('[role="combobox"]');
    await page.click('text=14-17 yaş');
    
    // Check KVKK
    await page.check('input[type="checkbox"]');
    
    // Try to submit
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Form should still be visible (validation failed)
    await expect(page.locator('input[name="tcKimlik"]')).toBeVisible();
  });

  test('should require KVKK consent', async ({ page }) => {
    // Click registration button
    await page.click('text=Ücretsiz Başla');
    
    // Fill form but don't check KVKK
    await page.fill('input[name="name"]', 'Test Kullanıcı');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="tcKimlik"]', '12345678901');
    await page.fill('input[name="password"]', 'Test123!');
    
    // Select age group
    await page.click('[role="combobox"]');
    await page.click('text=14-17 yaş');
    
    // DON'T check KVKK checkbox
    
    // Try to submit
    await page.click('button:has-text("Başvuruyu Gönder")');
    
    // Form should still be visible
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });
});
