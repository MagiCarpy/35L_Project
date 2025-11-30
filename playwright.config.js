import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',                    // Tests are in /e2e folder
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',  // Your Vite frontend
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd backend && npm start',  // Start your backend
      url: 'http://localhost:5000',        // Your backend URL
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd frontend && npm run dev', // Start your frontend
      url: 'http://localhost:5173',         // Your frontend URL  
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});