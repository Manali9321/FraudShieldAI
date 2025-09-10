import { test, expect } from '@playwright/test';
import { endpoints } from '../../src/utils/apiClient';

test('Explainability: reasons present and meaningful', async ({ request }) => {
  const hv = await (await request.post(endpoints.score, {
    data: { amount: 9000, usualAvg: 3000, locationDistanceKm: 50, deviceAnomalyScore: 0.2 }
  })).json();
  expect(hv.reasons).toContain('high_value');

  const geo = await (await request.post(endpoints.score, {
    data: { amount: 1500, usualAvg: 1400, locationDistanceKm: 1200, deviceAnomalyScore: 0.1 }
  })).json();
  expect(geo.reasons).toContain('unusual_location');
});
