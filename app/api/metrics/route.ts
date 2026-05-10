import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const metrics = await prisma.securityMetric.findMany({
    orderBy: { date: 'asc' },
    take: 30,
  });
  return NextResponse.json(metrics);
}
