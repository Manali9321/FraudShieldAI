import fs from 'fs';
import path from 'path';

export type Row = {
  amount: number;
  usualAvg: number;
  locationDistanceKm: number;
  deviceAnomalyScore: number;
  expected: 'ALERT'|'OK';
  why?: string[];
};

export function loadRows(): Row[] {
  const gen = path.join(process.cwd(), 'data', 'synthetic_generated.json');
  const seed = path.join(process.cwd(), 'data', 'seed_baseline.json');
  const p = fs.existsSync(gen) ? gen : seed;
  return JSON.parse(fs.readFileSync(p,'utf-8'));
}
