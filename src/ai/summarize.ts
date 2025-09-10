import fs from 'fs';
import path from 'path';

// -------- paths --------
const reportPath = path.join(process.cwd(), 'playwright-report.json');
const outPath    = path.join(process.cwd(), 'reporting', 'manager-summary.md');

// -------- helpers to walk Playwright JSON --------
type Result = { status?: string };
type Test   = { projectName?: string; results?: Result[] };
type Spec   = { title?: string; tests?: Test[] };
type Suite  = { title?: string; suites?: Suite[]; specs?: Spec[] };

function* walkSuites(s: Suite): Generator<Spec> {
  if (s.specs) for (const spec of s.specs) yield spec;
  if (s.suites) for (const child of s.suites) yield* walkSuites(child);
}

function readPlaywrightJSON() {
  if (!fs.existsSync(reportPath)) {
    console.error('❌ No Playwright JSON found. Run your tests first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8')) as { suites?: Suite[] };
}

// -------- NEW: pull explainability (reason) coverage from the mock server --------
async function getExplainabilityCoverage(): Promise<{
  available: boolean;
  counts: Record<'high_value'|'unusual_location'|'behavioural_anomaly', number>;
  baseUrl: string;
}> {
  const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const counts = { high_value: 0, unusual_location: 0, behavioural_anomaly: 0 } as const;
  const tally: any = { ...counts };

  try {
    // Node 18+ has global fetch; if not, this will throw and we’ll mark unavailable gracefully
    const res = await fetch(`${base}/alerts?ts=${Date.now()}`, { cache: 'no-store' as any });
    if (!res.ok) return { available: false, counts: tally, baseUrl: base };
    const alerts = await res.json();
    for (const a of alerts || []) {
      for (const r of a.reasons || []) {
        if (r in tally) tally[r] = (tally[r] ?? 0) + 1;
      }
    }
    return { available: true, counts: tally, baseUrl: base };
  } catch {
    return { available: false, counts: tally, baseUrl: base };
  }
}

// -------- main --------
(async () => {
  const report = readPlaywrightJSON();

  // Totals
  let total = 0, passed = 0, failed = 0, skipped = 0;
  const lines: string[] = [];

  for (const top of report.suites ?? []) {
    for (const spec of walkSuites(top)) {
      for (const test of spec.tests ?? []) {
        total++;
        const last = (test.results ?? [])[ (test.results ?? []).length - 1 ];
        const status = (last?.status ?? 'unknown') as string;
        if (status === 'passed') passed++;
        else if (status === 'skipped' || status === 'interrupted') skipped++;
        else failed++;
        lines.push(`- ${spec.title} [${test.projectName ?? ''}]: ${status}`);
      }
    }
  }

  // Explainability coverage (reasons seen on server)
  const coverage = await getExplainabilityCoverage();
  const mark = (n: number) => (n > 0 ? `✔ (${n})` : '—');

  // Write summary
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const md = `# QA Exec Summary

**Total:** ${total}  |  **Passed:** ${passed}  |  **Failed:** ${failed}  |  **Skipped:** ${skipped}

${lines.join('\n')}

---

${
  coverage.available
    ? `**Explainability coverage (from ${coverage.baseUrl}/alerts):**  \n` +
      `- high_value ${mark(coverage.counts.high_value)}  \n` +
      `- unusual_location ${mark(coverage.counts.unusual_location)}  \n` +
      `- behavioural_anomaly ${mark(coverage.counts.behavioural_anomaly)}`
    : `**Explainability coverage:** _(mock server not reachable; start your server then re-run this summary)_`
}

**Notes**
- Scenarios that raise alerts should include an explanation (reason).
- When you point to Hexaware Secure API, this summary will reflect live reasons as long as \`BASE_URL\` is set and reachable.
`;

  fs.writeFileSync(outPath, md);
  console.log('✅ Wrote', outPath);
})();
