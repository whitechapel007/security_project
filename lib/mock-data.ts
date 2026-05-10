import { ThreatEvent, RiskItem, AuditLog, SimulationScenario, Permission, SecurityMetric, StrideCount } from './types';

export const STRIDE_COLORS: Record<string, string> = {
  'Spoofing': '#06b6d4',
  'Tampering': '#f59e0b',
  'Repudiation': '#8b5cf6',
  'Information Disclosure': '#ef4444',
  'Denial of Service': '#f97316',
  'Elevation of Privilege': '#10b981',
};

export const SECURITY_SCORE = 72;

export const STRIDE_COUNTS: StrideCount[] = [
  { category: 'Spoofing', count: 12, color: '#06b6d4' },
  { category: 'Tampering', count: 8, color: '#f59e0b' },
  { category: 'Repudiation', count: 5, color: '#8b5cf6' },
  { category: 'Information Disclosure', count: 15, color: '#ef4444' },
  { category: 'Denial of Service', count: 6, color: '#f97316' },
  { category: 'Elevation of Privilege', count: 4, color: '#10b981' },
];

export const THREATS: ThreatEvent[] = [
  { id: 'T001', category: 'Spoofing', description: 'Phishing email targeting artist account with fake streaming portal login', severity: 'critical', timestamp: '2026-05-10T09:15:00Z', source: '185.220.101.47', target: 'Artist Portal', status: 'investigating' },
  { id: 'T002', category: 'Spoofing', description: 'Session token forgery attempt via intercepted cookie', severity: 'high', timestamp: '2026-05-10T06:22:00Z', source: '93.115.0.22', target: 'Auth Service', status: 'mitigated' },
  { id: 'T003', category: 'Spoofing', description: 'Fake login page mimicking cloud storage dashboard', severity: 'high', timestamp: '2026-05-09T21:45:00Z', source: '45.32.100.11', target: 'Cloud Storage', status: 'mitigated' },
  { id: 'T004', category: 'Spoofing', description: 'Identity impersonation on collaborative platform', severity: 'medium', timestamp: '2026-05-09T14:30:00Z', source: '102.89.5.200', target: 'Collaborator Hub', status: 'investigating' },
  { id: 'T005', category: 'Spoofing', description: 'DNS spoofing attempt on artist website domain', severity: 'high', timestamp: '2026-05-08T19:10:00Z', source: '23.95.7.33', target: 'Artist Website', status: 'mitigated' },
  { id: 'T006', category: 'Tampering', description: 'Audio file checksum mismatch detected on unreleased track', severity: 'critical', timestamp: '2026-05-10T08:20:00Z', source: 'Internal', target: 'Track: Summer_EP_Final.wav', status: 'active' },
  { id: 'T007', category: 'Tampering', description: 'Metadata modification on uploaded music file', severity: 'high', timestamp: '2026-05-09T17:05:00Z', source: '198.51.100.8', target: 'Metadata Service', status: 'investigating' },
  { id: 'T008', category: 'Tampering', description: 'Contract document alteration attempt detected', severity: 'high', timestamp: '2026-05-09T11:30:00Z', source: 'Unknown', target: 'Legal Docs', status: 'mitigated' },
  { id: 'T009', category: 'Tampering', description: 'Database record modification without authorisation', severity: 'medium', timestamp: '2026-05-08T22:00:00Z', source: '10.0.0.45', target: 'Royalties DB', status: 'active' },
  { id: 'T010', category: 'Repudiation', description: 'Login event logging disabled for 4 minutes', severity: 'high', timestamp: '2026-05-10T07:00:00Z', source: 'System', target: 'Audit Logger', status: 'mitigated' },
  { id: 'T011', category: 'Repudiation', description: 'Audit trail gap detected in file access logs', severity: 'medium', timestamp: '2026-05-09T16:45:00Z', source: 'System', target: 'Access Logs', status: 'investigating' },
  { id: 'T012', category: 'Repudiation', description: 'User denied initiating file download — log discrepancy', severity: 'low', timestamp: '2026-05-08T13:20:00Z', source: 'user@agency.com', target: 'Download Service', status: 'investigating' },
  { id: 'T013', category: 'Information Disclosure', description: 'Cloud storage bucket misconfigured as publicly accessible', severity: 'critical', timestamp: '2026-05-10T07:30:00Z', source: 'AWS Config', target: 'S3 Bucket: artist-media-prod', status: 'active' },
  { id: 'T014', category: 'Information Disclosure', description: 'API key found exposed in public GitHub repository', severity: 'critical', timestamp: '2026-05-09T13:20:00Z', source: 'GitHub Scanner', target: 'Streaming API Key', status: 'mitigated' },
  { id: 'T015', category: 'Information Disclosure', description: 'Private contract data accessible without authentication', severity: 'high', timestamp: '2026-05-09T10:45:00Z', source: 'Vulnerability Scanner', target: 'Contract Portal', status: 'mitigated' },
  { id: 'T016', category: 'Information Disclosure', description: 'Tour schedule leaked via unsecured API endpoint', severity: 'high', timestamp: '2026-05-08T15:10:00Z', source: '203.0.113.5', target: 'Tour API', status: 'mitigated' },
  { id: 'T017', category: 'Information Disclosure', description: 'Artist personal details visible in error stack trace', severity: 'medium', timestamp: '2026-05-08T09:00:00Z', source: 'App Server', target: 'Error Handler', status: 'mitigated' },
  { id: 'T018', category: 'Denial of Service', description: 'High-volume login attempts — 2,400 requests/minute', severity: 'high', timestamp: '2026-05-10T03:45:00Z', source: '185.180.143.49', target: 'Auth Endpoint', status: 'mitigated' },
  { id: 'T019', category: 'Denial of Service', description: 'DDoS attack on streaming distribution endpoint', severity: 'high', timestamp: '2026-05-09T20:30:00Z', source: 'Multiple IPs', target: 'CDN Edge Node', status: 'mitigated' },
  { id: 'T020', category: 'Denial of Service', description: 'Resource exhaustion on media processing service', severity: 'medium', timestamp: '2026-05-08T11:00:00Z', source: 'Internal', target: 'Media Transcoder', status: 'investigating' },
  { id: 'T021', category: 'Elevation of Privilege', description: 'Unauthorised admin panel access attempt by collaborator account', severity: 'critical', timestamp: '2026-05-10T06:15:00Z', source: 'collab@studio.io', target: 'Admin Dashboard', status: 'active' },
  { id: 'T022', category: 'Elevation of Privilege', description: 'Privilege escalation via JWT role claim manipulation', severity: 'high', timestamp: '2026-05-09T17:00:00Z', source: '78.46.200.9', target: 'JWT Service', status: 'mitigated' },
  { id: 'T023', category: 'Spoofing', description: 'OAuth token hijacking attempt via redirect URI manipulation', severity: 'high', timestamp: '2026-05-07T22:15:00Z', source: '45.155.205.35', target: 'OAuth Provider', status: 'mitigated' },
  { id: 'T024', category: 'Information Disclosure', description: 'Analytics data exported without manager approval', severity: 'medium', timestamp: '2026-05-07T14:30:00Z', source: 'analytics@label.com', target: 'Analytics Service', status: 'mitigated' },
  { id: 'T025', category: 'Tampering', description: 'Royalty split configuration changed without dual approval', severity: 'high', timestamp: '2026-05-07T10:00:00Z', source: 'admin@label.com', target: 'Royalty Config', status: 'investigating' },
];

export const RISK_ITEMS: RiskItem[] = [
  { id: 'R001', name: 'Phishing Attack on Artist', category: 'Spoofing', likelihood: 4, impact: 5, mitigation: 'Enable MFA, phishing-resistant email filtering, user training', status: 'open' },
  { id: 'R002', name: 'Cloud Misconfiguration Exposure', category: 'Information Disclosure', likelihood: 3, impact: 5, mitigation: 'CSPM tooling, automated compliance checks, least privilege access', status: 'open' },
  { id: 'R003', name: 'Audio File Tampering', category: 'Tampering', likelihood: 2, impact: 5, mitigation: 'SHA-256 integrity hashing, immutable storage, digital signatures', status: 'mitigated' },
  { id: 'R004', name: 'Account Takeover', category: 'Spoofing', likelihood: 3, impact: 5, mitigation: 'MFA, anomalous login detection, session binding', status: 'open' },
  { id: 'R005', name: 'API Key Leak', category: 'Information Disclosure', likelihood: 4, impact: 4, mitigation: 'Secret scanning in CI/CD, key rotation policy, vault management', status: 'open' },
  { id: 'R006', name: 'Denial of Service on CDN', category: 'Denial of Service', likelihood: 3, impact: 3, mitigation: 'WAF, rate limiting, CDN DDoS protection', status: 'mitigated' },
  { id: 'R007', name: 'Privilege Escalation via JWT', category: 'Elevation of Privilege', likelihood: 2, impact: 5, mitigation: 'Server-side role validation, short-lived tokens, token binding', status: 'open' },
  { id: 'R008', name: 'Metadata Manipulation', category: 'Tampering', likelihood: 3, impact: 3, mitigation: 'Metadata integrity checks, write access controls', status: 'mitigated' },
  { id: 'R009', name: 'Insider Threat – Contract Leak', category: 'Information Disclosure', likelihood: 2, impact: 4, mitigation: 'DLP policies, need-to-know access, activity monitoring', status: 'accepted' },
  { id: 'R010', name: 'Audit Log Gaps', category: 'Repudiation', likelihood: 2, impact: 3, mitigation: 'WORM audit logs, real-time log monitoring, alert on gaps', status: 'open' },
  { id: 'R011', name: 'Brute Force Authentication', category: 'Denial of Service', likelihood: 4, impact: 3, mitigation: 'Account lockout policy, CAPTCHA, IP-based rate limiting', status: 'mitigated' },
  { id: 'R012', name: 'Collaborator Over-Permissions', category: 'Elevation of Privilege', likelihood: 3, impact: 4, mitigation: 'Periodic access reviews, principle of least privilege, RBAC', status: 'open' },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'A001', timestamp: '2026-05-10T09:15:22Z', user: 'Alex Rivera', role: 'artist', action: 'LOGIN', resource: 'Artist Portal', status: 'success', ipAddress: '192.168.1.45', details: 'Successful login with MFA verification' },
  { id: 'A002', timestamp: '2026-05-10T09:16:05Z', user: 'Alex Rivera', role: 'artist', action: 'FILE_DOWNLOAD', resource: 'Summer_EP_Final.wav', status: 'success', ipAddress: '192.168.1.45', details: 'Master track downloaded' },
  { id: 'A003', timestamp: '2026-05-10T08:45:00Z', user: 'Unknown', role: 'collaborator', action: 'LOGIN_ATTEMPT', resource: 'Artist Portal', status: 'failure', ipAddress: '185.220.101.47', details: 'Failed login – incorrect credentials (attempt 5/5)' },
  { id: 'A004', timestamp: '2026-05-10T08:20:31Z', user: 'collab@studio.io', role: 'collaborator', action: 'ACCESS_DENIED', resource: 'Admin Dashboard', status: 'failure', ipAddress: '78.46.200.9', details: 'Unauthorised access attempt to admin panel' },
  { id: 'A005', timestamp: '2026-05-10T07:30:00Z', user: 'System', role: 'admin', action: 'CONFIG_CHANGE', resource: 'S3 Bucket: artist-media-prod', status: 'warning', ipAddress: 'Internal', details: 'Bucket ACL changed to public-read – flagged by CSPM' },
  { id: 'A006', timestamp: '2026-05-10T07:00:12Z', user: 'System', role: 'admin', action: 'AUDIT_GAP', resource: 'Audit Logger', status: 'warning', ipAddress: 'Internal', details: 'Logging service restart caused 4-minute audit gap' },
  { id: 'A007', timestamp: '2026-05-10T06:15:00Z', user: 'Marcus Thompson', role: 'manager', action: 'PERMISSION_CHANGE', resource: 'User: collab@studio.io', status: 'success', ipAddress: '10.0.0.12', details: 'Collaborator role demoted after privilege escalation attempt' },
  { id: 'A008', timestamp: '2026-05-10T05:00:00Z', user: 'System', role: 'admin', action: 'THREAT_DETECTED', resource: 'Auth Endpoint', status: 'warning', ipAddress: '185.180.143.49', details: 'Rate limiting triggered – 2,400 req/min blocked' },
  { id: 'A009', timestamp: '2026-05-09T21:00:00Z', user: 'Alex Rivera', role: 'artist', action: 'FILE_UPLOAD', resource: 'Collab_Mix_v3.wav', status: 'success', ipAddress: '192.168.1.45', details: 'Audio file uploaded and integrity hash generated' },
  { id: 'A010', timestamp: '2026-05-09T20:30:00Z', user: 'System', role: 'admin', action: 'DDOS_BLOCKED', resource: 'CDN Edge Node', status: 'warning', ipAddress: 'Multiple', details: 'DDoS attack mitigated – 14,000 malicious requests blocked' },
  { id: 'A011', timestamp: '2026-05-09T17:00:00Z', user: 'System', role: 'admin', action: 'TOKEN_REVOKED', resource: 'JWT Service', status: 'success', ipAddress: 'Internal', details: 'Suspicious JWT with elevated role claim revoked' },
  { id: 'A012', timestamp: '2026-05-09T16:00:00Z', user: 'Priya Nair', role: 'manager', action: 'REPORT_GENERATED', resource: 'Security Report – May 2026', status: 'success', ipAddress: '10.0.0.20', details: 'Monthly STRIDE threat report exported as PDF' },
  { id: 'A013', timestamp: '2026-05-09T14:30:00Z', user: 'Alex Rivera', role: 'artist', action: 'MFA_ENABLED', resource: 'Account Settings', status: 'success', ipAddress: '192.168.1.45', details: 'TOTP-based MFA enabled on artist account' },
  { id: 'A014', timestamp: '2026-05-09T13:20:00Z', user: 'System', role: 'admin', action: 'KEY_ROTATED', resource: 'Streaming API Key', status: 'success', ipAddress: 'Internal', details: 'Leaked API key rotated after GitHub scanner alert' },
  { id: 'A015', timestamp: '2026-05-09T12:00:00Z', user: 'Marcus Thompson', role: 'manager', action: 'USER_INVITED', resource: 'User: newcollab@music.co', status: 'success', ipAddress: '10.0.0.12', details: 'New collaborator invited with minimal permissions' },
  { id: 'A016', timestamp: '2026-05-09T10:45:00Z', user: 'System', role: 'admin', action: 'VULN_PATCHED', resource: 'Contract Portal', status: 'success', ipAddress: 'Internal', details: 'Unauthenticated contract endpoint patched and redeployed' },
  { id: 'A017', timestamp: '2026-05-08T22:00:00Z', user: 'Unknown', role: 'collaborator', action: 'DB_TAMPER_ATTEMPT', resource: 'Royalties DB', status: 'failure', ipAddress: '10.0.0.45', details: 'Direct database write attempt blocked by firewall rule' },
  { id: 'A018', timestamp: '2026-05-08T19:10:00Z', user: 'System', role: 'admin', action: 'DNS_ALERT', resource: 'Artist Website Domain', status: 'warning', ipAddress: '23.95.7.33', details: 'DNS spoofing attempt detected and neutralised by DNSSEC' },
  { id: 'A019', timestamp: '2026-05-08T15:10:00Z', user: 'System', role: 'admin', action: 'ENDPOINT_SECURED', resource: 'Tour API', status: 'success', ipAddress: 'Internal', details: 'Tour schedule endpoint secured with authentication requirement' },
  { id: 'A020', timestamp: '2026-05-08T09:00:00Z', user: 'Alex Rivera', role: 'artist', action: 'LOGOUT', resource: 'Artist Portal', status: 'success', ipAddress: '192.168.1.45', details: 'User session terminated' },
  { id: 'A021', timestamp: '2026-05-08T08:00:00Z', user: 'Priya Nair', role: 'manager', action: 'LOGIN', resource: 'Artist Portal', status: 'success', ipAddress: '10.0.0.20', details: 'Manager login via SSO with MFA' },
  { id: 'A022', timestamp: '2026-05-07T23:00:00Z', user: 'System', role: 'admin', action: 'BACKUP_COMPLETE', resource: 'Media Storage', status: 'success', ipAddress: 'Internal', details: 'Nightly encrypted backup completed – 48.2 GB' },
  { id: 'A023', timestamp: '2026-05-07T22:15:00Z', user: 'System', role: 'admin', action: 'OAUTH_BLOCKED', resource: 'OAuth Provider', status: 'warning', ipAddress: '45.155.205.35', details: 'Malicious redirect URI in OAuth flow blocked' },
  { id: 'A024', timestamp: '2026-05-07T14:30:00Z', user: 'analytics@label.com', role: 'collaborator', action: 'DATA_EXPORT', resource: 'Analytics Service', status: 'warning', ipAddress: '203.0.113.5', details: 'Large analytics export without manager approval – flagged' },
  { id: 'A025', timestamp: '2026-05-07T10:00:00Z', user: 'System', role: 'admin', action: 'CONFIG_ALERT', resource: 'Royalty Config', status: 'warning', ipAddress: 'Internal', details: 'Royalty split change flagged for dual-approval review' },
];

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SIM001',
    name: 'Phishing Attack Simulation',
    type: 'phishing',
    description: 'Simulates a targeted spear-phishing campaign targeting the artist\'s streaming platform credentials using lookalike domains and urgency tactics.',
    attackSuccessWithout: 78,
    attackSuccessWith: 12,
    detectionRate: 94,
    recoveryTime: '23 minutes',
    controls: ['MFA enforcement', 'Email phishing filters', 'User awareness training', 'Anomalous login detection'],
  },
  {
    id: 'SIM002',
    name: 'Cloud Misconfiguration Exploit',
    type: 'misconfiguration',
    description: 'Simulates exploitation of a publicly accessible cloud storage bucket containing unreleased music and private contracts.',
    attackSuccessWithout: 65,
    attackSuccessWith: 5,
    detectionRate: 91,
    recoveryTime: '8 minutes',
    controls: ['CSPM automated scanning', 'Least privilege access', 'Bucket policy enforcement', 'Real-time config alerts'],
  },
  {
    id: 'SIM003',
    name: 'Audio File Metadata Tampering',
    type: 'tampering',
    description: 'Simulates an attacker modifying copyright metadata on uploaded audio files to alter ownership attribution and royalty routing.',
    attackSuccessWithout: 45,
    attackSuccessWith: 3,
    detectionRate: 97,
    recoveryTime: '4 minutes',
    controls: ['SHA-256 integrity hashing', 'Immutable audit trail', 'Digital watermarking', 'Write access controls'],
  },
];

export const PERMISSIONS: Permission[] = [
  { action: 'View Security Dashboard', artist: true, manager: true, admin: true, collaborator: false },
  { action: 'Upload Audio Files', artist: true, manager: true, admin: true, collaborator: true },
  { action: 'Download Master Tracks', artist: true, manager: true, admin: true, collaborator: false },
  { action: 'View STRIDE Reports', artist: true, manager: true, admin: true, collaborator: false },
  { action: 'Run Attack Simulations', artist: false, manager: true, admin: true, collaborator: false },
  { action: 'Manage User Roles', artist: false, manager: false, admin: true, collaborator: false },
  { action: 'View Audit Logs', artist: false, manager: true, admin: true, collaborator: false },
  { action: 'Modify Royalty Config', artist: false, manager: false, admin: true, collaborator: false },
  { action: 'Export Analytics Data', artist: false, manager: true, admin: true, collaborator: false },
  { action: 'Manage API Keys', artist: false, manager: false, admin: true, collaborator: false },
  { action: 'Invite Collaborators', artist: false, manager: true, admin: true, collaborator: false },
  { action: 'View Contract Documents', artist: true, manager: true, admin: true, collaborator: false },
];

export const SAMPLE_USERS = [
  { id: 'U001', name: 'Alex Rivera', email: 'alex@artistshield.io', role: 'artist' as const, mfaEnabled: true, lastLogin: '2026-05-10T09:15:00Z', status: 'active' },
  { id: 'U002', name: 'Marcus Thompson', email: 'marcus@mgmt.io', role: 'manager' as const, mfaEnabled: true, lastLogin: '2026-05-10T08:00:00Z', status: 'active' },
  { id: 'U003', name: 'Priya Nair', email: 'priya@mgmt.io', role: 'manager' as const, mfaEnabled: true, lastLogin: '2026-05-09T08:00:00Z', status: 'active' },
  { id: 'U004', name: 'Jordan Kim', email: 'collab@studio.io', role: 'collaborator' as const, mfaEnabled: false, lastLogin: '2026-05-10T08:20:00Z', status: 'suspended' },
  { id: 'U005', name: 'System Admin', email: 'admin@artistshield.io', role: 'admin' as const, mfaEnabled: true, lastLogin: '2026-05-10T07:00:00Z', status: 'active' },
];

function generateMetrics(): SecurityMetric[] {
  const metrics: SecurityMetric[] = [];
  const baseScore = 58;
  for (let i = 29; i >= 0; i--) {
    const date = new Date('2026-05-10');
    date.setDate(date.getDate() - i);
    const dayScore = Math.min(100, Math.max(40, baseScore + Math.floor((29 - i) * 0.5) + Math.floor(Math.random() * 8 - 3)));
    metrics.push({
      date: date.toISOString().split('T')[0],
      score: dayScore,
      threats: Math.floor(Math.random() * 8) + 1,
      resolved: Math.floor(Math.random() * 7) + 1,
    });
  }
  return metrics;
}

export const SECURITY_METRICS = generateMetrics();
