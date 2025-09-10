import express from 'express';
import path from 'path';
import { config as dotenv } from 'dotenv';
import { score, Txn } from './rules';


dotenv();
const app = express();
app.use(express.json());

app.set('etag', false); // disable ETag generation globally
app.use((req, res, next) => {
  if (
    req.path.startsWith('/alerts') ||
    req.path.startsWith('/score')  ||
    req.path.startsWith('/seed')
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// In-memory alert store
type Alert = { id: string; txn: Txn; score: number; reasons: string[]; status: 'OPEN'|'CLEARED' };
const alerts: Alert[] = [];

// Serve static dashboard (CJS-friendly __dirname)
const staticDir = path.join(__dirname, '..', 'dashboard', 'public');
app.use('/', express.static(staticDir));

// API: score a transaction
// API: score a transaction (supports dry-run so we don't persist alerts)
app.post('/score', (req, res) => {
  // never cache API responses
  res.set('Cache-Control', 'no-store');

  // allow either query ?dry=1 or body { dryRun: true }
  const isDry =
    req.query.dry === '1' ||
    req.body?.dryRun === true;

  // minimal validation
  const { amount, usualAvg, locationDistanceKm, deviceAnomalyScore } = req.body ?? {};
  if (
    typeof amount !== 'number' ||
    typeof usualAvg !== 'number' ||
    typeof locationDistanceKm !== 'number' ||
    typeof deviceAnomalyScore !== 'number'
  ) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  const txn: Txn = { amount, usualAvg, locationDistanceKm, deviceAnomalyScore };
  const result = score(txn); // -> { score, reasons, alert }

  // only persist alerts when NOT dry-run
  if (result.alert && !isDry) {
    const id = 'A' + (alerts.length + 1).toString().padStart(4, '0');
    alerts.push({
      id,
      txn,
      score: result.score,
      reasons: result.reasons,
      status: 'OPEN'
    });
    return res.json({ ...result, alertId: id });
  }

  // dry-run or no alert: just return the computed result
  return res.json(result);
});

// Alerts endpoints
app.get('/alerts', (_req, res) => res.json(alerts));
app.post('/alerts/:id/clear', (req, res) => {
  const { id } = req.params;
  const found = alerts.find(a => a.id === id);
  if (!found) return res.status(404).json({ error: 'not_found' });
  found.status = 'CLEARED';
  res.json({ ok: true, alert: found });
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 3000);
function seedOnStart() {
  const samples = [
    { amount: 9000, usualAvg: 3000, locationDistanceKm: 50,   deviceAnomalyScore: 0.2 }, // high_value
    { amount: 1500, usualAvg: 1400, locationDistanceKm: 1200, deviceAnomalyScore: 0.1 }, // unusual_location
    { amount: 1300, usualAvg: 1200, locationDistanceKm: 50,   deviceAnomalyScore: 0.9 }, // behavioural_anomaly
  ];
  for (const txn of samples) {
    const r = score(txn);
    if (r.alert) {
      const id = 'A' + String(alerts.length + 1).padStart(4, '0');
      alerts.push({ id, txn, score: r.score, reasons: r.reasons, status: 'OPEN' });
    }
  }
}

if (process.env.SEED_ON_START === '1') {
  console.log('[mock] Seeding sample alerts on start');
  seedOnStart();
}

// Wipe all alerts (for clean demos)
app.post('/reset', (_req, res) => {
  alerts.length = 0;
  res.json({ ok: true, total: 0 });
});

// Seed 3 alerts; if already populated, skip unless force=1
app.post('/seed', (req, res) => {
  const force = req.query.force === '1';
  if (alerts.length > 0 && !force) {
    return res.json({ ok: true, created: 0, total: alerts.length, note: 'skipped (already populated)' });
  }
  if (force) alerts.length = 0;

  const samples = [
    { amount: 9000, usualAvg: 3000, locationDistanceKm: 50,   deviceAnomalyScore: 0.2 }, // high_value
    { amount: 1500, usualAvg: 1400, locationDistanceKm: 1200, deviceAnomalyScore: 0.1 }, // unusual_location
    { amount: 1300, usualAvg: 1200, locationDistanceKm: 50,   deviceAnomalyScore: 0.9 }, // behavioural_anomaly
  ];
  let created = 0;
  for (const txn of samples) {
    const r = score(txn);
    if (r.alert) {
      const id = 'A' + (alerts.length + 1).toString().padStart(4, '0');
      alerts.push({ id, txn, score: r.score, reasons: r.reasons, status: 'OPEN' });
      created++;
    }
  }
  res.json({ ok: true, created, total: alerts.length });
});

const reportDir = path.resolve(process.cwd(), 'html-report');

app.use('/report', express.static(reportDir, { index: ['index.html'] }));

app.use('/qa', express.static(path.resolve(process.cwd(), 'data')));



app.listen(PORT, () => console.log(`Mock FraudShield server running on http://localhost:${PORT}`));
