export type Txn = {
  amount: number;
  usualAvg: number;
  locationDistanceKm: number;
  deviceAnomalyScore: number;
  id?: string;
};

export type ScoreResult = { score: number; reasons: string[]; alert: boolean };

export function score(txn: Txn): ScoreResult {
  const reasons: string[] = [];
  if (txn.amount > txn.usualAvg * 1.5) reasons.push('high_value');
  if (txn.locationDistanceKm > 500) reasons.push('unusual_location');
  if (txn.deviceAnomalyScore > 0.7) reasons.push('behavioural_anomaly');

  const score = Math.min(1, (
    (txn.amount / Math.max(1, txn.usualAvg)) * 0.2 +
    (txn.locationDistanceKm / 2000) * 0.3 +
    (txn.deviceAnomalyScore) * 0.5
  ));

  // TC3 business rule: unusual location must raise an alert even if composite score < 0.5
  const alert = reasons.includes('unusual_location') || (reasons.length > 0 && score >= 0.5);

  return { score, reasons, alert };
}
