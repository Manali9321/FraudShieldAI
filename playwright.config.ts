import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
reporter: [['html', { open: 'never', outputFolder: 'html-report' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  workers: 4
});
