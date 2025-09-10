import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Collect from all tests, but filter down to TC1–TC6 by title
  testDir: './tests',
  // Hide non-demo areas by path (adjust if your layout differs)
  testIgnore: [
    '**/perf/**',
    '**/ui/**',
    '**/golden/**',
    '**/contract/**',
    '**/*boundary*.*'
  ],
  // Final safety net: only titles starting with TC1: ... TC6:
  grep: [/^TC[1-6]:/],
  reporter: [['html', { open: 'never', outputFolder: 'html-report-demo' }]],
  fullyParallel: true,
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
});
