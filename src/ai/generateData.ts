import fs from 'fs';
import path from 'path';

type Row = {
  amount: number;
  usualAvg: number;
  locationDistanceKm: number;
  deviceAnomalyScore: number;
  expected: 'ALERT'|'OK';
  why?: string[];
};

function row(amount:number, usualAvg:number, dist:number, device:number): Row {
  const reasons:string[] = [];
  if (amount > usualAvg * 1.5) reasons.push('high_value');
  if (dist > 500) reasons.push('unusual_location');
  if (device > 0.7) reasons.push('behavioural_anomaly');
  const expected = reasons.length ? 'ALERT' : 'OK';
  return { amount, usualAvg, locationDistanceKm: dist, deviceAnomalyScore: device, expected, why: reasons };
}

const rows: Row[] = [
  row(1200, 1100, 20, 0.1),     // near normal -> OK (TC1)
  row(9000, 3000, 50, 0.2),     // high value -> ALERT (TC2)
  row(1500, 1400, 1200, 0.1),   // unusual location -> ALERT (TC3)
  row(1300, 1200, 50, 0.9),     // behavioural anomaly -> ALERT (TC4)
  row(6000, 5800, 10, 0.2),     // borderline high but OK after verify flow (TC5 demo)
  // Data poisoning style: many benign-looking high device noise but within limits
  row(1400, 1300, 30, 0.69),    // OK but near threshold
  row(1600, 1000, 30, 0.2),     // ALERT high_value
];

const outPath = path.join(process.cwd(), 'data', 'synthetic_generated.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log('Wrote', outPath);
