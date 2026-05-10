import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const scenarios = await prisma.simulationScenario.findMany({
    orderBy: { createdAt: 'asc' },
    include: { results: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  const data = scenarios.map((s) => ({
    ...s,
    controls: JSON.parse(s.controls) as string[],
  }));

  return NextResponse.json(data);
}
