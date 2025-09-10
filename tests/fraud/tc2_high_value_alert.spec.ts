import { test, expect } from '@playwright/test';
import { endpoints } from '../../src/utils/apiClient';

test('TC2: High value transaction -> alert with reason (adapter endpoints)', async ({ request }) => {
  // Force a high-value pattern (amount >> usualAvg)
  const payload = {
    amount: 9000,
    usualAvg: 3000,
    locationDistanceKm: 50,
    deviceAnomalyScore: 0.2
  };

  const res = await request.post(endpoints.score, { data: payload });
  expect(res.ok()).toBeTruthy();

  const json = await res.json();
  expect(json.alert).toBeTruthy();
  expect(Array.isArray(json.reasons)).toBeTruthy();
  expect(json.reasons).toContain('high_value');   // Explainability assertion
  expect(json.alertId).toBeTruthy();              // Should create an alert
});
