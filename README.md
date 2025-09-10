# FraudShield-QA (Playwright + TypeScript)

Local QA-first prototype for FraudShield AI. Run a mock API + dashboard, generate synthetic data, execute Playwright tests that mirror PPT scenarios (TC#1–TC#6), and produce a manager summary.

## Prereqs
- Node.js 18+
- `npm` or `pnpm`

## Quick start
```bash
cp .env.sample .env
npm install
npm run dev:server   # in one terminal: starts http://localhost:3000
npm run ai:gen-data  # in another: writes data/synthetic_generated.json
npm test             # runs Playwright (Chromium + Firefox)
npm run ai:summarize # writes reporting/manager-summary.md
```

Open `http://localhost:3000` to view the mock Analyst Dashboard.
Switch to Hexaware Secure API later by setting `BASE_URL` to their endpoint(s).

## Notes
- Tests included: TC1 (valid-no-alert), TC2 (high-value-alert). Add more under `tests/fraud/`.
- All API endpoints are in `src/server/index.ts`.
- Heuristics are in `src/server/rules.ts` (replace with Secure API logic later).
