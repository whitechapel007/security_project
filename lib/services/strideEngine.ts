export type StrideCategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

const PATTERNS: [StrideCategory, RegExp][] = [
  ['Spoofing', /spoof|phish|impersonat|fake|forge|credential.*theft|login.*fake|identity|pretend|masquerad/i],
  ['Tampering', /tamper|modif|alter|corrupt|inject|manipulat|checksum|integrity|unauthori.*change|falsif/i],
  ['Repudiation', /repudiat|deny|log.*gap|audit.*disabl|no.*record|erase.*log|delete.*log|trail.*miss/i],
  ['Information Disclosure', /disclos|expos|leak|public.*access|sensitiv|api.*key|secret.*expos|unauthori.*read|data.*breach/i],
  ['Denial of Service', /dos|ddos|flood|exhaust|brute.*(force|login)|rate.*limit|overload|resource.*exhaust|service.*unavail/i],
  ['Elevation of Privilege', /escalat|privilege|elevat|unauthori.*admin|bypass.*auth|role.*abuse|admin.*access/i],
];

export function classifyStride(text: string): StrideCategory {
  for (const [category, regex] of PATTERNS) {
    if (regex.test(text)) return category;
  }
  return 'Spoofing';
}

export function severityFromScore(score: number): string {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6)  return 'medium';
  return 'low';
}
