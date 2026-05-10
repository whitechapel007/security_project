export function calculateRiskScore(likelihood: number, impact: number): number {
  const l = Math.min(5, Math.max(1, likelihood));
  const i = Math.min(5, Math.max(1, impact));
  return l * i;
}

export function getRiskLevel(score: number): string {
  if (score >= 15) return 'critical';
  if (score >= 9)  return 'high';
  if (score >= 4)  return 'medium';
  return 'low';
}

export interface RiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  overallScore: number;
}

export function summariseRisks(items: { likelihood: number; impact: number }[]): RiskSummary {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  let total = 0;

  for (const item of items) {
    const score = calculateRiskScore(item.likelihood, item.impact);
    const level = getRiskLevel(score) as keyof typeof counts;
    counts[level]++;
    total += score;
  }

  return {
    ...counts,
    overallScore: items.length > 0 ? Math.round(total / items.length) : 0,
  };
}
