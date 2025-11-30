import { test, expect } from '@playwright/test';

test('complete user authentication flow', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@ucla.edu`,
    password: 'TestPassword123!'
  };

  console.log('🚀 Starting authentication E2E test...');

  // Step 1: Navigate to signup page
  await page.goto('/signup');
  await expect(page).toHaveURL('/signup');

  // Step 2: Fill form
  await page.fill('#username', testUser.username);
  await page.fill('#email', testUser.email);
  await page.fill('#password', testUser.password);

  // Step 3: Click the SUBMIT button (not the toggle button)
  // The submit button has type="submit" and text "Submit"
  await page.click('button[type="submit"]');

  // Step 4: Wait for API call
  const registerResponse = await page.waitForResponse(response => 
    response.url().includes('/api/user/register')
  );
  console.log('✅ Registration API response:', registerResponse.status());

  // Step 5: Form should switch to login mode automatically
  await expect(page.locator('#username')).toBeHidden();

  // Step 6: Click login button (credentials should be auto-filled)
  await page.click('button[type="submit"]');

  // Step 7: Wait for login and redirect
  await expect(page).toHaveURL(/\/home/);
  await expect(page.locator('text=Profile')).toBeVisible();

  console.log('✅ Authentication test completed!');
});