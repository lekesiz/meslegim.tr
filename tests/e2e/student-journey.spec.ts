import { test, expect } from '@playwright/test';

/**
 * Student Journey E2E Tests
 * 
 * Tests the complete student journey:
 * 1. Login as active student
 * 2. View available stages
 * 3. Start and complete stage form
 * 4. View generated report
 */

test.describe('Student Journey', () => {
  // Test student credentials (should be an active student)
  const studentEmail = 'test.student@example.com';
  const studentPassword = 'Test123!';

  test('should login as student successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    
    // Submit
    await page.click('button:has-text("Giriş Yap")');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify student dashboard is loaded
    await expect(page.locator('text=Hoş Geldin')).toBeVisible({ timeout: 10000 });
  });

  test('should display available stages', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Check if stages are visible
    const hasStages = await page.locator('text=Etap').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=Henüz aktif etabınız bulunmuyor').isVisible().catch(() => false);
    
    expect(hasStages || hasEmptyState).toBeTruthy();
  });

  test('should start a stage form', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Check if there's a "Başla" button (stage not started yet)
    const startButton = page.locator('button:has-text("Etabı Başlat")').first();
    const isVisible = await startButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click start button
      await startButton.click();
      
      // Wait for form to load
      await page.waitForTimeout(2000);
      
      // Verify form is displayed
      const hasForm = await page.locator('form').isVisible().catch(() => false);
      expect(hasForm).toBeTruthy();
    } else {
      // Skip test if no available stages to start
      test.skip();
    }
  });

  test('should fill and submit stage form', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Check if there's a form to fill
    const continueButton = page.locator('button:has-text("Devam Et")').first();
    const isVisible = await continueButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click continue to open form
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      // Fill form fields (assuming text inputs and textareas)
      const textInputs = page.locator('input[type="text"], textarea');
      const count = await textInputs.count();
      
      for (let i = 0; i < count; i++) {
        await textInputs.nth(i).fill('Test cevabı - Bu bir test yanıtıdır.');
      }
      
      // Submit form
      const submitButton = page.locator('button:has-text("Gönder")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for success message
        await page.waitForTimeout(3000);
        
        // Check for success toast
        const toast = page.locator('[data-sonner-toast]');
        await expect(toast).toBeVisible({ timeout: 5000 });
      }
    } else {
      // Skip test if no form available
      test.skip();
    }
  });

  test('should view pending report', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Look for "Rapor Hazırlanıyor" or similar status
    const hasPendingReport = await page.locator('text=Rapor Hazırlanıyor').isVisible().catch(() => false);
    const hasReportReady = await page.locator('text=Rapor Hazır').isVisible().catch(() => false);
    
    expect(hasPendingReport || hasReportReady).toBeTruthy();
  });

  test('should view approved report', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Look for "Raporu Görüntüle" button
    const viewReportButton = page.locator('button:has-text("Raporu Görüntüle")').first();
    const isVisible = await viewReportButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click to view report
      await viewReportButton.click();
      
      // Wait for report to load
      await page.waitForTimeout(2000);
      
      // Verify report content is displayed
      const hasReportContent = await page.locator('text=Kariyer Değerlendirme Raporu').isVisible().catch(() => false);
      expect(hasReportContent).toBeTruthy();
    } else {
      // Skip test if no approved report available
      test.skip();
    }
  });

  test('should download report as PDF', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for stages to load
    await page.waitForTimeout(2000);
    
    // Look for "PDF İndir" button
    const downloadButton = page.locator('button:has-text("PDF İndir")').first();
    const isVisible = await downloadButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click download button
      await downloadButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download started
      expect(download.suggestedFilename()).toContain('.pdf');
    } else {
      // Skip test if no download button available
      test.skip();
    }
  });

  test('should display progress indicator', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for dashboard to load
    await page.waitForTimeout(2000);
    
    // Check if progress indicator exists
    const hasProgress = await page.locator('text=İlerleme').isVisible().catch(() => false);
    const hasStageCount = await page.locator('text=Etap').isVisible().catch(() => false);
    
    expect(hasProgress || hasStageCount).toBeTruthy();
  });
});
