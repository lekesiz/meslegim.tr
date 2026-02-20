import { test, expect } from '@playwright/test';

/**
 * Mentor Approval Flow E2E Tests
 * 
 * Tests the mentor approval workflow:
 * 1. Mentor login
 * 2. View pending students
 * 3. Approve student
 * 4. Verify student activation
 */

test.describe('Mentor Approval Flow', () => {
  // Test mentor credentials
  const mentorEmail = 'mikaillekesiz@gmail.com';
  const mentorPassword = 'Test123!';

  test('should login as mentor successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    
    // Submit
    await page.click('button:has-text("Giriş Yap")');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify dashboard is loaded
    await expect(page.locator('text=Mentor Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should display pending students list', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to Bekleyen Öğrenciler tab
    await page.click('text=Bekleyen Öğrenciler');
    
    // Wait for students list to load
    await page.waitForTimeout(2000);
    
    // Check if table or empty state is visible
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=Bekleyen öğrenci bulunmuyor').isVisible().catch(() => false);
    
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should activate a pending student', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to Bekleyen Öğrenciler tab
    await page.click('text=Bekleyen Öğrenciler');
    await page.waitForTimeout(2000);
    
    // Check if there are pending students
    const hasPendingStudents = await page.locator('button:has-text("Aktif Et")').isVisible().catch(() => false);
    
    if (hasPendingStudents) {
      // Get student name before activation
      const studentRow = page.locator('table tbody tr').first();
      const studentName = await studentRow.locator('td').first().textContent();
      
      // Click activate button
      await studentRow.locator('button:has-text("Aktif Et")').click();
      
      // Wait for confirmation or success message
      await page.waitForTimeout(2000);
      
      // Check for success toast
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      
      // Verify student is no longer in pending list
      await page.waitForTimeout(1000);
      const stillPending = await page.locator(`text=${studentName}`).isVisible().catch(() => false);
      expect(stillPending).toBeFalsy();
    } else {
      // Skip test if no pending students
      test.skip();
    }
  });

  test('should view active students', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to Aktif Öğrenciler tab
    await page.click('text=Aktif Öğrenciler');
    
    // Wait for students list to load
    await page.waitForTimeout(2000);
    
    // Check if table or empty state is visible
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=Aktif öğrenci bulunmuyor').isVisible().catch(() => false);
    
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should view student details', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to Aktif Öğrenciler tab
    await page.click('text=Aktif Öğrenciler');
    await page.waitForTimeout(2000);
    
    // Check if there are active students
    const hasActiveStudents = await page.locator('table tbody tr').count() > 0;
    
    if (hasActiveStudents) {
      // Click on first student's details button
      const detailsButton = page.locator('button:has-text("Detaylar")').first();
      if (await detailsButton.isVisible()) {
        await detailsButton.click();
        
        // Wait for details dialog/page to open
        await page.waitForTimeout(1000);
        
        // Verify details are shown (dialog or new page)
        const hasDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        const hasDetailsPage = page.url().includes('/student/');
        
        expect(hasDialog || hasDetailsPage).toBeTruthy();
      }
    } else {
      // Skip test if no active students
      test.skip();
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', mentorEmail);
    await page.fill('input[name="password"]', mentorPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Click logout button (usually in header or sidebar)
    const logoutButton = page.locator('button:has-text("Çıkış")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for redirect to home or login
      await page.waitForTimeout(2000);
      
      // Verify we're logged out (should be on home or login page)
      const url = page.url();
      expect(url).toMatch(/\/(login|$)/);
    }
  });
});
