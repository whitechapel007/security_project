import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';

const schema = z.object({ scenarioId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const scenario = await prisma.simulationScenario.findUnique({ where: { id: parsed.data.scenarioId } });
  if (!scenario) return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });

  const result = await prisma.simulationResult.create({
    data: {
      scenarioId: scenario.id,
      attackSuccessBefore: scenario.attackSuccessWithout,
      attackSuccessAfter: scenario.attackSuccessWith,
      detectionRate: scenario.detectionRate,
      recoveryTime: scenario.recoveryTime,
      ranBy: session.name,
    },
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'RUN',
    resource: 'Simulation',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Ran simulation: ${scenario.name}`,
  });

  return NextResponse.json(result, { status: 201 });
}
