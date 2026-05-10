import { prisma } from '@/lib/db';

export async function logEvent(params: {
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  details: string;
}) {
  return prisma.auditLog.create({ data: params });
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'Unknown';
}
