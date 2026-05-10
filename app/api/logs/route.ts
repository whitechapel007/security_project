import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
  const status = searchParams.get('status');
  const action = searchParams.get('action');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (action) where.action = action;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'VIEW',
    resource: 'Logs',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Viewed audit logs (limit=${limit})`,
  });

  return NextResponse.json(logs);
}
