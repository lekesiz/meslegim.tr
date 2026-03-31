import { Page, BrowserContext } from '@playwright/test';

/**
 * Login helper that works around SameSite=None + Secure=false cookie issue on localhost.
 * Uses API login and manually sets the cookie in the browser context.
 */
export async function loginAs(page: Page, context: BrowserContext, email: string, password: string) {
  // Full isolation: clear cookies
  await context.clearCookies();
  
  // Navigate to login page first to establish origin
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  // Get the base URL
  const baseURL = new URL(page.url()).origin;
  
  // Call login API using Playwright's request (which captures Set-Cookie headers)
  const response = await page.request.post(`${baseURL}/api/trpc/auth.login`, {
    data: { json: { email, password } },
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok()) {
    throw new Error(`Login API failed: ${response.status()}`);
  }
  
  // Extract Set-Cookie header from response
  const setCookieHeader = response.headers()['set-cookie'];
  
  if (setCookieHeader) {
    // Parse cookie name and value from Set-Cookie header
    // Format: "app_session=eyJ...; Path=/; HttpOnly; SameSite=None"
    const cookies = setCookieHeader.split(',').map(c => c.trim());
    
    for (const cookieStr of cookies) {
      const parts = cookieStr.split(';')[0].trim();
      const eqIndex = parts.indexOf('=');
      if (eqIndex > 0) {
        const name = parts.substring(0, eqIndex);
        const value = parts.substring(eqIndex + 1);
        
        const url = new URL(baseURL);
        await context.addCookies([{
          name,
          value,
          domain: url.hostname,
          path: '/',
          httpOnly: true,
          sameSite: 'Lax', // Override SameSite for localhost
        }]);
      }
    }
  }
  
  // Navigate to dashboard - cookie should now be set
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Verify we're on dashboard
  const currentUrl = page.url();
  if (currentUrl.includes('login')) {
    // Cookie approach failed, try UI login as fallback
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.locator('#email').fill(email);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(password);
    await page.waitForTimeout(200);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1000);
  }
}
