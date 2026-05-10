import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logEvent, getClientIp } from '@/lib/services/auditService';

const updateSchema = z.object({
  role: z.enum(['admin', 'manager', 'artist', 'collaborator']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  mfaEnabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, mfaEnabled: true, status: true },
  });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'UPDATE',
    resource: 'Users',
    status: 'success',
    ipAddress: getClientIp(req),
    details: `Updated user ${user.email}: ${JSON.stringify(parsed.data)}`,
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const user = await prisma.user.delete({ where: { id } });

  await logEvent({
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    action: 'DELETE',
    resource: 'Users',
    status: 'warning',
    ipAddress: getClientIp(req),
    details: `Deleted user: ${user.email}`,
  });

  return NextResponse.json({ ok: true });
}
