import { test, expect } from '@playwright/test';

test('TC6: Data poisoning simulation -> benign near-threshold rows do not trigger alerts', async ({ request }) => {
  const benignRows = Array.from({ length: 20 }).map((_, i) => ({
    amount: 1300 + (i % 5),
    usualAvg: 1300,
    locationDistanceKm: 40 + (i % 10),
    deviceAnomalyScore: 0.65 + (i % 2) * 0.02  // stays < 0.7
  }));
  for (const r of benignRows) {
    const res = await request.post('/score', { data: r });
    const json = await res.json();
    expect(res.ok()).toBeTruthy();
    expect(json.alert).toBeFalsy();
  }
});
