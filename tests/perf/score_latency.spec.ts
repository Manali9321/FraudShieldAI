import { test, expect } from '@playwright/test';
import { endpoints } from '../../src/utils/apiClient';

// Configure via env if you need: LATENCY_P95_MS=150
const P95_TARGET_MS = Number(process.env.LATENCY_P95_MS || 150);
const RUNS = Number(process.env.LATENCY_RUNS || 10);

function percentile(arr: number[], p: number) {
  const a = [...arr].sort((x, y) => x - y);
  const i = Math.ceil((p / 100) * a.length) - 1;
  return a[Math.max(0, i)];
}

test.describe('Perf: /score latency', () => {
  test(`p95 under ${P95_TARGET_MS}ms over ${RUNS} runs`, async ({ request }) => {
    const payload = {
      amount: 2000,
      usualAvg: 1000,
      locationDistanceKm: 50,
      deviceAnomalyScore: 0.3,
      // IMPORTANT: no dryRun here — we want real behavior
      // If you prefer not to create alerts during perf runs, use your /score?dry=1
    };

    const times: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const t0 = Date.now();
      const res = await request.post(endpoints.score, { data: payload });
      expect(res.ok(), `Run #${i + 1} failed with ${res.status()}`).toBeTruthy();
      await res.json();
      times.push(Date.now() - t0);
    }

    const p50 = percentile(times, 50);
    const p95 = percentile(times, 95);
    const p99 = percentile(times, 99);

    // Console summary shows up in the HTML report logs
    console.log(`[perf] /score p50=${p50.toFixed(1)}ms p95=${p95.toFixed(1)}ms p99=${p99.toFixed(1)}ms over ${RUNS} runs`);

    expect(p95).toBeLessThan(P95_TARGET_MS);
  });
});
