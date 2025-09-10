import { test, expect } from '@playwright/test';
import { endpoints } from '../../src/utils/apiClient';

test('TC4: Account takeover (behavioural) -> alert with reason (adapter endpoints)', async ({ request }) => {
  // Device/login anomaly dominant
  const payload = {
    amount: 1300,
    usualAvg: 1200,
    locationDistanceKm: 50,
    deviceAnomalyScore: 0.9     // > 0.7 triggers behavioural_anomaly
  };

  const res = await request.post(endpoints.score, { data: payload });
  expect(res.ok()).toBeTruthy();

  const json = await res.json();
  expect(json.alert).toBeTruthy();
  expect(json.reasons).toContain('behavioural_anomaly');  // Explainability assertion
  expect(json.alertId).toBeTruthy();
});
