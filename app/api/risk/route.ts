import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';
import { summariseRisks } from '@/lib/services/riskCalculator';

export async function GET() {
  const items = await prisma.riskItem.findMany({ orderBy: { createdAt: 'desc' } });
  const summary = summariseRisks(items);
  return NextResponse.json({ items, summary });
}

const schema = z.object({
  name: z.string().min(3),
  category: z.string().min(1),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  mitigation: z.string().min(5),
  status: z.enum(['open', 'mitigated', 'accepted']).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.riskItem.create({ data: { ...parsed.data, status: parsed.data.status ?? 'open' } });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'CREATE',
    resource: 'Risk',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Created risk item: ${parsed.data.name}`,
  });

  return NextResponse.json(item, { status: 201 });
}
