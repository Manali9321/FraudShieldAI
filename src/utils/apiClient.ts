/**
 * Lightweight endpoint adapter for local mock vs Hexaware Secure API.
 *
 * How it works:
 * - Playwright uses baseURL from playwright.config.ts or .env (BASE_URL).
 * - Tests import { endpoints } and call:
 *      request.post(endpoints.score, { data: ... })
 *      request.post(endpoints.clear(alertId))
 *
 * Switch modes by setting API_MODE=local|secure in .env
 * (defaults to 'local' if unset).
 *
 * Optional overrides (useful for Secure API):
 *   SCORE_PATH=/api/v1/score
 *   CLEAR_PATH_TEMPLATE=/api/v1/alerts/{id}/clear    // {id} or :id supported
 */

type ApiMode = 'local' | 'secure';

const mode: ApiMode = (process.env.API_MODE?.toLowerCase() as ApiMode) || 'local';

// Default paths (local mock)
const DEFAULT_LOCAL_SCORE = '/score';
const DEFAULT_LOCAL_CLEAR_TMPL = '/alerts/{id}/clear';

// Secure API can differ; allow env overrides
const SECURE_SCORE = process.env.SCORE_PATH || '/score';
const SECURE_CLEAR_TMPL = process.env.CLEAR_PATH_TEMPLATE || '/alerts/{id}/clear';

// Simple template replacer supporting `{id}` or `:id`
function fillId(template: string, id: string): string {
  const safe = encodeURIComponent(id);
  if (template.includes('{id}')) return template.replace('{id}', safe);
  if (template.includes(':id')) return template.replace(':id', safe);
  // Fallback: append
  return template.endsWith('/') ? template + safe : `${template}/${safe}`;
}

export interface EndpointMap {
  /** relative path to POST a scoring request */
  score: string;
  /** function that returns the path to clear/resolve an alert */
  clear: (id: string) => string;
  /** current mode for debugging/logging */
  mode: ApiMode;
}

const localEndpoints: EndpointMap = {
  score: DEFAULT_LOCAL_SCORE,
  clear: (id: string) => fillId(DEFAULT_LOCAL_CLEAR_TMPL, id),
  mode: 'local'
};

const secureEndpoints: EndpointMap = {
  score: SECURE_SCORE,
  clear: (id: string) => fillId(SECURE_CLEAR_TMPL, id),
  mode: 'secure'
};

/**
 * Exported adapter used by tests.
 * Usage:
 *   import { endpoints } from '../../src/utils/apiClient';
 *   await request.post(endpoints.score, { data: payload });
 *   await request.post(endpoints.clear(alertId));
 */
export const endpoints: EndpointMap =
  mode === 'secure' ? secureEndpoints : localEndpoints;

/** Optional helper if you need branching in tests */
export const isSecureMode = (): boolean => endpoints.mode === 'secure';
