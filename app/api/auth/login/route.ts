import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(req);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await logEvent({
      userName: email,
      userRole: 'unknown',
      action: 'LOGIN',
      resource: 'Auth',
      status: 'failure',
      ipAddress: ip,
      details: `Failed login attempt for ${email}`,
    });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.status === 'suspended') {
    await logEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      resource: 'Auth',
      status: 'failure',
      ipAddress: ip,
      details: 'Login blocked — account suspended',
    });
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  });

  await logEvent({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN',
    resource: 'Auth',
    status: 'success',
    ipAddress: ip,
    details: 'Successful login',
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mfaEnabled: user.mfaEnabled,
    status: user.status,
  });
}
