import { test, expect } from '@playwright/test';
import { endpoints } from '../../src/utils/apiClient';

test('TC5: False positive -> clear alert after verification (adapter endpoints)', async ({ request }) => {
  // Start with an alerting transaction (e.g., high_value)
  const payload = {
    amount: 8000,
    usualAvg: 2500,
    locationDistanceKm: 20,
    deviceAnomalyScore: 0.15
  };

  const scoreRes = await request.post(endpoints.score, { data: payload });
  expect(scoreRes.ok()).toBeTruthy();

  const scored = await scoreRes.json();
  expect(scored.alert).toBeTruthy();
  expect(scored.alertId).toBeTruthy();

  // Simulate successful customer verification by clearing the alert
  const clearRes = await request.post(endpoints.clear(scored.alertId));
  expect(clearRes.ok()).toBeTruthy();

  const cleared = await clearRes.json();
  expect(cleared.alert?.status).toBe('CLEARED');
});
