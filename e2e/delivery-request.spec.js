import { test, expect } from '@playwright/test';

test('delivery request creation and routing flow', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
    email: `test_${timestamp}@ucla.edu`,
    password: 'TestPassword123!'
    };

    const deliveryRequest = {
    item: `Test Item ${timestamp}`,
    pickupKey: 'De Neve', 
    dropoffKey: 'Olympic Hall' 
    };

    console.log('🚀 Starting delivery request E2E test...');

    // Register test user
    await page.goto('/signup');
    await page.fill('#username', `testuser_${timestamp}`);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForResponse(response => 
    response.url().includes('/api/user/register')
    );

    // Login with the new user
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/home/);
    console.log('Test user created and logged in');

    await page.goto('/requests');
    await expect(page).toHaveURL('/requests');
    console.log('Navigated to requests page');


    await page.goto('/requests/new');
    await expect(page).toHaveURL('/requests/new');
    console.log('Navigated to new request page');

    // Fill out and submit delivery request form
    await page.fill('label:has-text("Item:") + input', deliveryRequest.item);

    await page.selectOption('label:has-text("Pickup") + select', deliveryRequest.pickupKey);

    await page.selectOption('label:has-text("Dropoff") + select', deliveryRequest.dropoffKey);

    console.log('Delivery request form filled');

    await page.click('button:has-text("Create")');

    await page.waitForResponse(response => 
    response.url().includes('/api/requests')
    );
    console.log('Delivery request submitted');

    await expect(page).toHaveURL('/requests');

    await expect(page.locator(`text=${deliveryRequest.item}`).or(page.locator('text=Test Item'))).toBeVisible();

    console.log('Delivery request appears in list');

    console.log('Delivery request complete');
});