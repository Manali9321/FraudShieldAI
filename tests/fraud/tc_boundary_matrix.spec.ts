import { test, expect } from '@playwright/test';
import rows from '../../data/boundaries.json';
import { endpoints } from '../../src/utils/apiClient';

for (const r of rows) {
  test(`Boundary: ${r.name}`, async ({ request }) => {
    const res = await request.post(endpoints.score, {
      data: { amount:r.amount, usualAvg:r.usualAvg, locationDistanceKm:r.distance, deviceAnomalyScore:r.device }
    });
    const j = await res.json();
    expect(j.alert).toBe(r.wantAlert);
  });
}
