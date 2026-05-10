import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex@artistshield.io' },
      update: {},
      create: {
        name: 'Alex Rivera',
        email: 'alex@artistshield.io',
        passwordHash: password,
        role: 'admin',
        mfaEnabled: true,
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maya@artistshield.io' },
      update: {},
      create: {
        name: 'Maya Chen',
        email: 'maya@artistshield.io',
        passwordHash: password,
        role: 'manager',
        mfaEnabled: true,
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sam@artistshield.io' },
      update: {},
      create: {
        name: 'Sam Wilson',
        email: 'sam@artistshield.io',
        passwordHash: password,
        role: 'artist',
        mfaEnabled: false,
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { email: 'taylor@artistshield.io' },
      update: {},
      create: {
        name: 'Taylor Brooks',
        email: 'taylor@artistshield.io',
        passwordHash: password,
        role: 'collaborator',
        mfaEnabled: false,
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jordan@artistshield.io' },
      update: {},
      create: {
        name: 'Jordan Kim',
        email: 'jordan@artistshield.io',
        passwordHash: password,
        role: 'artist',
        mfaEnabled: false,
        status: 'suspended',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // ── Threats ──────────────────────────────────────────────────────────────
  await prisma.threat.deleteMany();
  const threats = await prisma.threat.createMany({
    data: [
      { category: 'Spoofing', description: 'Phishing email targeting artist management accounts', severity: 'high', source: 'External Attacker', target: 'Management Portal', status: 'active', likelihood: 4, impact: 4, riskScore: 16 },
      { category: 'Tampering', description: 'Unauthorized modification of streaming royalty data', severity: 'critical', source: 'Insider Threat', target: 'Revenue Database', status: 'investigating', likelihood: 3, impact: 5, riskScore: 15 },
      { category: 'Repudiation', description: 'Missing audit trails for contract modifications', severity: 'medium', source: 'System Gap', target: 'Contract Management', status: 'mitigated', likelihood: 3, impact: 3, riskScore: 9 },
      { category: 'Information Disclosure', description: 'Exposed API keys in public GitHub repository', severity: 'critical', source: 'Developer Error', target: 'API Services', status: 'active', likelihood: 5, impact: 5, riskScore: 25 },
      { category: 'Denial of Service', description: 'DDoS attack during album release event', severity: 'high', source: 'Botnet', target: 'Streaming Platform', status: 'mitigated', likelihood: 4, impact: 4, riskScore: 16 },
      { category: 'Elevation of Privilege', description: 'Exploitation of admin panel vulnerability', severity: 'critical', source: 'APT Group', target: 'Admin Dashboard', status: 'active', likelihood: 3, impact: 5, riskScore: 15 },
      { category: 'Spoofing', description: 'Fake social media profiles impersonating artists', severity: 'medium', source: 'Social Engineering', target: 'Fan Accounts', status: 'investigating', likelihood: 5, impact: 3, riskScore: 15 },
      { category: 'Tampering', description: 'SQL injection in merchandise payment processor', severity: 'high', source: 'External Attacker', target: 'E-commerce Portal', status: 'active', likelihood: 3, impact: 4, riskScore: 12 },
      { category: 'Information Disclosure', description: 'Unencrypted personal data in transit', severity: 'high', source: 'Configuration Error', target: 'Mobile App API', status: 'active', likelihood: 4, impact: 4, riskScore: 16 },
      { category: 'Denial of Service', description: 'Resource exhaustion via brute force login attempts', severity: 'medium', source: 'Automated Bot', target: 'Authentication Service', status: 'mitigated', likelihood: 5, impact: 3, riskScore: 15 },
      { category: 'Repudiation', description: 'No logging for financial transaction approvals', severity: 'high', source: 'Compliance Gap', target: 'Finance Module', status: 'active', likelihood: 2, impact: 5, riskScore: 10 },
      { category: 'Elevation of Privilege', description: 'Role confusion in multi-tenant architecture', severity: 'critical', source: 'Logic Flaw', target: 'Access Control Layer', status: 'investigating', likelihood: 3, impact: 5, riskScore: 15 },
      { category: 'Spoofing', description: 'Man-in-the-middle attack on tour management app', severity: 'high', source: 'Network Attacker', target: 'Tour Coordination App', status: 'active', likelihood: 3, impact: 4, riskScore: 12 },
      { category: 'Tampering', description: 'Playlist manipulation via compromised partner API', severity: 'medium', source: 'Supply Chain', target: 'Distribution API', status: 'mitigated', likelihood: 2, impact: 4, riskScore: 8 },
      { category: 'Information Disclosure', description: 'Artist location data leaked through metadata', severity: 'high', source: 'Photo Upload Feature', target: 'Media Storage', status: 'active', likelihood: 4, impact: 4, riskScore: 16 },
      { category: 'Denial of Service', description: 'NFT mint flooding overwhelms blockchain node', severity: 'medium', source: 'Economic Attack', target: 'NFT Platform', status: 'investigating', likelihood: 3, impact: 3, riskScore: 9 },
      { category: 'Elevation of Privilege', description: 'JWT token forgery grants admin access', severity: 'critical', source: 'Crypto Weakness', target: 'Auth Tokens', status: 'mitigated', likelihood: 2, impact: 5, riskScore: 10 },
      { category: 'Spoofing', description: 'Credential stuffing against fan club portal', severity: 'medium', source: 'Credential Database Leak', target: 'Fan Portal', status: 'active', likelihood: 4, impact: 3, riskScore: 12 },
      { category: 'Tampering', description: 'Unauthorised edits to live setlist via unsecured endpoint', severity: 'low', source: 'Insider', target: 'Setlist Management', status: 'mitigated', likelihood: 2, impact: 2, riskScore: 4 },
      { category: 'Repudiation', description: 'Deleted event logs preventing incident investigation', severity: 'high', source: 'Malicious Insider', target: 'Log Storage', status: 'active', likelihood: 2, impact: 5, riskScore: 10 },
      { category: 'Information Disclosure', description: 'Backup files publicly accessible via misconfigured S3', severity: 'critical', source: 'Cloud Misconfiguration', target: 'S3 Backup Bucket', status: 'active', likelihood: 4, impact: 5, riskScore: 20 },
      { category: 'Denial of Service', description: 'Ticket purchase queue overwhelmed by scalpers', severity: 'medium', source: 'Scalper Bots', target: 'Ticketing System', status: 'mitigated', likelihood: 5, impact: 3, riskScore: 15 },
      { category: 'Elevation of Privilege', description: 'Collaborator accessing restricted financial reports', severity: 'high', source: 'RBAC Misconfiguration', target: 'Reporting Module', status: 'investigating', likelihood: 3, impact: 4, riskScore: 12 },
      { category: 'Spoofing', description: 'Fake streaming plays via bot network inflating counts', severity: 'medium', source: 'Click Farm', target: 'Analytics Module', status: 'active', likelihood: 5, impact: 3, riskScore: 15 },
      { category: 'Tampering', description: 'Checksum mismatch on downloaded release files', severity: 'low', source: 'CDN Compromise', target: 'File Distribution', status: 'mitigated', likelihood: 1, impact: 3, riskScore: 3 },
    ],
  });
  console.log(`Created ${threats.count} threats`);

  // ── Risk Items ───────────────────────────────────────────────────────────
  await prisma.riskItem.deleteMany();
  const risks = await prisma.riskItem.createMany({
    data: [
      { name: 'Phishing Attack on Artist', category: 'Spoofing', likelihood: 4, impact: 5, mitigation: 'Enable MFA, phishing-resistant email filtering, user training', status: 'open' },
      { name: 'Cloud Misconfiguration Exposure', category: 'Information Disclosure', likelihood: 3, impact: 5, mitigation: 'CSPM tooling, automated compliance checks, least privilege access', status: 'open' },
      { name: 'Audio File Tampering', category: 'Tampering', likelihood: 2, impact: 5, mitigation: 'SHA-256 integrity hashing, immutable storage, digital signatures', status: 'mitigated' },
      { name: 'Account Takeover via Credential Stuffing', category: 'Spoofing', likelihood: 3, impact: 5, mitigation: 'MFA, anomalous login detection, session binding', status: 'open' },
      { name: 'API Key Leak in Repository', category: 'Information Disclosure', likelihood: 4, impact: 4, mitigation: 'Secret scanning in CI/CD, key rotation policy, vault management', status: 'open' },
      { name: 'DDoS Attack on CDN', category: 'Denial of Service', likelihood: 3, impact: 3, mitigation: 'WAF, rate limiting, CDN DDoS protection', status: 'mitigated' },
      { name: 'Privilege Escalation via JWT', category: 'Elevation of Privilege', likelihood: 2, impact: 5, mitigation: 'Server-side role validation, short-lived tokens, token binding', status: 'open' },
      { name: 'Metadata Manipulation on Tracks', category: 'Tampering', likelihood: 3, impact: 3, mitigation: 'Metadata integrity checks, write access controls', status: 'mitigated' },
      { name: 'Insider Threat — Contract Leak', category: 'Information Disclosure', likelihood: 2, impact: 4, mitigation: 'DLP policies, need-to-know access, activity monitoring', status: 'accepted' },
      { name: 'Audit Log Deletion', category: 'Repudiation', likelihood: 2, impact: 5, mitigation: 'WORM storage, off-site log replication, immutable audit trail', status: 'open' },
      { name: 'Brute Force on Auth Endpoint', category: 'Denial of Service', likelihood: 5, impact: 3, mitigation: 'Rate limiting, CAPTCHA, account lockout policy', status: 'mitigated' },
      { name: 'Admin Role Abuse', category: 'Elevation of Privilege', likelihood: 2, impact: 5, mitigation: 'Segregation of duties, just-in-time access, PAM solution', status: 'open' },
    ],
  });
  console.log(`Created ${risks.count} risk items`);

  // ── Simulation Scenarios ─────────────────────────────────────────────────
  await prisma.simulationScenario.deleteMany();
  const scenarios = await prisma.simulationScenario.createMany({
    data: [
      {
        name: 'Phishing Campaign',
        type: 'phishing',
        description: 'Simulated spear-phishing targeting artist management team with fake contract renewal emails. Tests email security, user awareness, and incident response.',
        attackSuccessWithout: 73,
        attackSuccessWith: 12,
        detectionRate: 89,
        recoveryTime: '2.4 hours',
        controls: JSON.stringify(['Email filtering (SPF/DKIM/DMARC)', 'Security awareness training', 'Multi-factor authentication', 'Incident response playbook']),
      },
      {
        name: 'Cloud Misconfiguration',
        type: 'misconfiguration',
        description: 'Tests detection and response to publicly exposed S3 buckets containing unreleased music and personal data. Evaluates cloud security posture and monitoring.',
        attackSuccessWithout: 91,
        attackSuccessWith: 8,
        detectionRate: 95,
        recoveryTime: '45 minutes',
        controls: JSON.stringify(['Cloud Security Posture Management (CSPM)', 'Automated misconfiguration detection', 'Access logging and alerting', 'Least-privilege IAM policies']),
      },
      {
        name: 'Data Tampering Attack',
        type: 'tampering',
        description: 'Simulates insider threat modifying streaming royalty figures and contract terms. Tests database integrity controls, audit logging, and change detection systems.',
        attackSuccessWithout: 64,
        attackSuccessWith: 5,
        detectionRate: 97,
        recoveryTime: '6.2 hours',
        controls: JSON.stringify(['Database activity monitoring', 'Immutable audit logs', 'Cryptographic data integrity checks', 'Segregation of duties']),
      },
    ],
  });
  console.log(`Created ${scenarios.count} simulation scenarios`);

  // ── Audit Logs ────────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  const auditLogs = [
    { userName: 'Alex Rivera', userRole: 'admin', action: 'LOGIN', resource: 'Auth', status: 'success', ipAddress: '192.168.1.100', details: 'Successful login with MFA', createdAt: hoursAgo(0.1) },
    { userName: 'Maya Chen', userRole: 'manager', action: 'VIEW', resource: 'Threats', status: 'success', ipAddress: '10.0.0.55', details: 'Accessed threat dashboard', createdAt: hoursAgo(0.3) },
    { userName: 'Sam Wilson', userRole: 'artist', action: 'LOGIN', resource: 'Auth', status: 'failure', ipAddress: '203.0.113.45', details: 'Invalid password attempt', createdAt: hoursAgo(0.5) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'CREATE', resource: 'Users', status: 'success', ipAddress: '192.168.1.100', details: 'Created new collaborator account', createdAt: hoursAgo(1) },
    { userName: 'Taylor Brooks', userRole: 'collaborator', action: 'VIEW', resource: 'Risk', status: 'success', ipAddress: '10.0.0.78', details: 'Viewed risk assessment matrix', createdAt: hoursAgo(1.5) },
    { userName: 'Maya Chen', userRole: 'manager', action: 'UPDATE', resource: 'Threats', status: 'success', ipAddress: '10.0.0.55', details: 'Updated threat status to mitigated', createdAt: hoursAgo(2) },
    { userName: 'Unknown', userRole: 'none', action: 'LOGIN', resource: 'Auth', status: 'failure', ipAddress: '185.220.101.34', details: 'Brute force attempt detected', createdAt: hoursAgo(2.5) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'DELETE', resource: 'Users', status: 'warning', ipAddress: '192.168.1.100', details: 'Suspended user account — Jordan Kim', createdAt: hoursAgo(3) },
    { userName: 'Sam Wilson', userRole: 'artist', action: 'VIEW', resource: 'Encryption', status: 'success', ipAddress: '172.16.0.22', details: 'Accessed encryption demo module', createdAt: hoursAgo(4) },
    { userName: 'Taylor Brooks', userRole: 'collaborator', action: 'VIEW', resource: 'Simulation', status: 'failure', ipAddress: '10.0.0.78', details: 'Access denied — insufficient permissions', createdAt: hoursAgo(4.5) },
    { userName: 'Maya Chen', userRole: 'manager', action: 'RUN', resource: 'Simulation', status: 'success', ipAddress: '10.0.0.55', details: 'Executed phishing simulation scenario', createdAt: hoursAgo(5) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'UPDATE', resource: 'Settings', status: 'success', ipAddress: '192.168.1.100', details: 'Updated RBAC permissions for manager role', createdAt: hoursAgo(6) },
    { userName: 'Unknown', userRole: 'none', action: 'LOGIN', resource: 'Auth', status: 'failure', ipAddress: '45.33.32.156', details: 'Automated credential stuffing detected', createdAt: hoursAgo(7) },
    { userName: 'Sam Wilson', userRole: 'artist', action: 'VIEW', resource: 'Dashboard', status: 'success', ipAddress: '172.16.0.22', details: 'Viewed security posture overview', createdAt: hoursAgo(8) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'EXPORT', resource: 'Logs', status: 'success', ipAddress: '192.168.1.100', details: 'Exported audit logs for compliance review', createdAt: hoursAgo(9) },
    { userName: 'Taylor Brooks', userRole: 'collaborator', action: 'VIEW', resource: 'RBAC', status: 'failure', ipAddress: '10.0.0.78', details: 'Access denied to user management panel', createdAt: hoursAgo(10) },
    { userName: 'Maya Chen', userRole: 'manager', action: 'CREATE', resource: 'Risk', status: 'success', ipAddress: '10.0.0.55', details: 'Added new risk item: API key exposure', createdAt: hoursAgo(12) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'UPDATE', resource: 'Threats', status: 'success', ipAddress: '192.168.1.100', details: 'Escalated threat severity to critical', createdAt: hoursAgo(14) },
    { userName: 'Sam Wilson', userRole: 'artist', action: 'UPDATE', resource: 'Profile', status: 'success', ipAddress: '172.16.0.22', details: 'Updated personal security preferences', createdAt: hoursAgo(15) },
    { userName: 'Unknown', userRole: 'none', action: 'SCAN', resource: 'Auth', status: 'warning', ipAddress: '198.51.100.77', details: 'Port scan detected from external IP', createdAt: hoursAgo(16) },
    { userName: 'Maya Chen', userRole: 'manager', action: 'VIEW', resource: 'Metrics', status: 'success', ipAddress: '10.0.0.55', details: 'Accessed 30-day security metrics report', createdAt: hoursAgo(18) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'CREATE', resource: 'Threats', status: 'success', ipAddress: '192.168.1.100', details: 'Logged new threat: S3 misconfiguration', createdAt: hoursAgo(20) },
    { userName: 'Taylor Brooks', userRole: 'collaborator', action: 'LOGIN', resource: 'Auth', status: 'success', ipAddress: '10.0.0.78', details: 'Successful login — new device', createdAt: hoursAgo(22) },
    { userName: 'Sam Wilson', userRole: 'artist', action: 'LOGOUT', resource: 'Auth', status: 'success', ipAddress: '172.16.0.22', details: 'User logged out', createdAt: hoursAgo(24) },
    { userName: 'Alex Rivera', userRole: 'admin', action: 'REVIEW', resource: 'Simulation', status: 'success', ipAddress: '192.168.1.100', details: 'Reviewed data tampering simulation results', createdAt: hoursAgo(26) },
  ] as const;

  await prisma.auditLog.createMany({ data: auditLogs as any });
  console.log(`Created ${auditLogs.length} audit logs`);

  // ── Security Metrics (30 days) ────────────────────────────────────────────
  await prisma.securityMetric.deleteMany();

  const metricsData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const base = 62 + i * 0.7;
    return {
      date: d.toISOString().split('T')[0],
      score: Math.min(100, Math.round(base + (Math.random() * 8 - 4))),
      threats: Math.round(12 - i * 0.25 + (Math.random() * 4 - 2)),
      resolved: Math.round(8 - i * 0.1 + (Math.random() * 3 - 1.5)),
    };
  });

  await prisma.securityMetric.createMany({ data: metricsData });
  console.log(`Created ${metricsData.length} security metrics`);

  console.log('✅  Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
