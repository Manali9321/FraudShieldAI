import { test, expect } from '@playwright/test';
import { loadRows } from '../fixtures/test-data';

test('TC1: Valid transaction -> no alert', async ({ request }) => {
  const rows = loadRows();
  const r = rows.find(r => r.expected === 'OK')!;
  const res = await request.post('/score', { data: {
    amount: r.amount,
    usualAvg: r.usualAvg,
    locationDistanceKm: r.locationDistanceKm,
    deviceAnomalyScore: r.deviceAnomalyScore
  }});
  const json = await res.json();
  expect(res.ok()).toBeTruthy();
  expect(json.alert).toBeFalsy();
});
