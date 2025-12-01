import { test, expect } from '@playwright/test';

test('complete user authentication flow', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@ucla.edu`,
    password: 'TestPassword123!'
  };

  console.log('Starting authentication E2E test...');


  await page.goto('/signup');
  await expect(page).toHaveURL('/signup');

  await page.fill('#username', testUser.username);
  await page.fill('#email', testUser.email);
  await page.fill('#password', testUser.password);


  await page.click('button[type="submit"]');

  const registerResponse = await page.waitForResponse(response => 
    response.url().includes('/api/user/register')
  );
  console.log('✅ Registration API response:', registerResponse.status());

  await expect(page.locator('#username')).toBeHidden();

  // Credentials autofilled submit
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/home/);
  await expect(page.locator('text=Profile')).toBeVisible();

  console.log('✅ Authentication test completed!');
});