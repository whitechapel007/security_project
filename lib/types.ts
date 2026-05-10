export type UserRole = 'artist' | 'manager' | 'admin' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  mfaEnabled: boolean;
}

export type StrideCategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ThreatStatus = 'active' | 'mitigated' | 'investigating';

export interface ThreatEvent {
  id: string;
  category: StrideCategory;
  description: string;
  severity: SeverityLevel;
  timestamp: string;
  source: string;
  target: string;
  status: ThreatStatus;
}

export interface RiskItem {
  id: string;
  name: string;
  category: StrideCategory;
  likelihood: number; // 1–5
  impact: number; // 1–5
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  details: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  type: 'phishing' | 'misconfiguration' | 'tampering';
  description: string;
  attackSuccessWithout: number;
  attackSuccessWith: number;
  detectionRate: number;
  recoveryTime: string;
  controls: string[];
}

export interface Permission {
  action: string;
  artist: boolean;
  manager: boolean;
  admin: boolean;
  collaborator: boolean;
}

export interface SecurityMetric {
  date: string;
  score: number;
  threats: number;
  resolved: number;
}

export interface StrideCount {
  category: StrideCategory;
  count: number;
  color: string;
}
