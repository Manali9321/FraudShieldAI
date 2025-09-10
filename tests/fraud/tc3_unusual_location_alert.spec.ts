import { test, expect } from '@playwright/test';
import { loadRows } from '../fixtures/test-data';

test('TC3: Unusual location -> alert with reason', async ({ request }) => {
  const rows = loadRows();
  const r = rows.find(r => r.why?.includes('unusual_location'));
  test.skip(!r, 'No unusual_location row found in dataset');
  const res = await request.post('/score', { data: {
    amount: r!.amount,
    usualAvg: r!.usualAvg,
    locationDistanceKm: r!.locationDistanceKm,
    deviceAnomalyScore: r!.deviceAnomalyScore
  }});
  const json = await res.json();
  expect(res.ok()).toBeTruthy();
  expect(json.alert).toBeTruthy();
  expect(json.reasons).toContain('unusual_location');
});
