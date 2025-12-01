import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',                    
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',  
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
      command: 'cd backend && npm start',  
      url: 'http://localhost:5000',       
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd frontend && npm run dev', 
      url: 'http://localhost:5173',        
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});