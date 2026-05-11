import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';
import { runSimulation } from '@/lib/services/simulationEngine';

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

  // Run Monte Carlo simulation for this scenario type
  const report = runSimulation(scenario.type);

  const result = await prisma.simulationResult.create({
    data: {
      scenarioId:           scenario.id,
      attackSuccessBefore:  report.baseline.attackSuccessRate,
      attackSuccessAfter:   report.controlled.attackSuccessRate,
      detectionRate:        report.controlled.detectionRate,
      baselineDetectionRate: report.baseline.detectionRate,
      recoveryTime:         scenario.recoveryTime,
      ranBy:                session.name,
      totalAttempts:        report.controlled.totalAttempts,
      meanTimeToDetection:  report.controlled.meanTimeToDetection,
      falsePositiveRate:    report.controlled.falsePositiveRate,
    },
  });

  await logEvent({
    userId:   session.userId,
    userName: session.name,
    userRole: session.role,
    action:   'RUN',
    resource: 'Simulation',
    status:   'success',
    ipAddress: getClientIp(req),
    details: `Ran ${scenario.name}: ASR ${report.baseline.attackSuccessRate}% → ${report.controlled.attackSuccessRate}% (${report.attackSuccessReduction}pp reduction)`,
  });

  return NextResponse.json({ result, report }, { status: 201 });
}
