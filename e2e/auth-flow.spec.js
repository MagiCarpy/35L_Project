import { test, expect } from '@playwright/test';

test('complete user authentication flow', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@gmail.com`,
    password: 'thisIsatTestPass1!'  
  };

  console.log('Starting authentication E2E test...');


  await page.goto('/signup');
  await expect(page).toHaveURL('/signup');
  console.log('On signup page');

  await page.fill('p:has-text("Username") + input', testUser.username);
  await page.fill('p:has-text("Email") + input', testUser.email);
  await page.fill('p:has-text("Password") + input', testUser.password);
  console.log('Form filled');
  
  await page.click('button:has-text("Sign Up")[type="submit"]');
  
  await page.waitForURL('/Dashboard');
  
  console.log('Registration successful, redirected to dashboard');

  await expect(page.locator('text=Profile')).toBeVisible();

  console.log('Authentication test success');
});