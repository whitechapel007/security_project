import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';
import { classifyStride } from '@/lib/services/strideEngine';
import { calculateRiskScore } from '@/lib/services/riskCalculator';

export async function GET() {
  const threats = await prisma.threat.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(threats);
}

const createSchema = z.object({
  description: z.string().min(5),
  source: z.string().min(1),
  target: z.string().min(1),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  severity: z.string().optional(),
  status: z.enum(['active', 'mitigated', 'investigating']).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { description, source, target, likelihood, impact, status } = parsed.data;
  const category = classifyStride(description);
  const riskScore = calculateRiskScore(likelihood, impact);

  const threat = await prisma.threat.create({
    data: { category, description, source, target, likelihood, impact, riskScore, status: status ?? 'active', severity: parsed.data.severity ?? 'medium' },
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'CREATE',
    resource: 'Threats',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Created threat: ${description.slice(0, 60)}`,
  });

  return NextResponse.json(threat, { status: 201 });
}
