import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, mfaEnabled: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'VIEW',
    resource: 'Users',
    status: 'success',
    ipAddress: getClientIp(req),
    details: 'Listed all users',
  });

  return NextResponse.json(users);
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'artist', 'collaborator']),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true, mfaEnabled: true, status: true, createdAt: true },
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'CREATE',
    resource: 'Users',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Created user: ${parsed.data.email} (${parsed.data.role})`,
  });

  return NextResponse.json(user, { status: 201 });
}
