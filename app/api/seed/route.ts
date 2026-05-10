import { NextResponse } from 'next/server';

// Only enabled in development for resetting demo data
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { execSync } = await import('child_process');
  try {
    execSync('npx tsx prisma/seed.ts', { cwd: process.cwd(), stdio: 'pipe' });
    return NextResponse.json({ ok: true, message: 'Database re-seeded' });
  } catch (e) {
    return NextResponse.json({ error: 'Seed failed', details: String(e) }, { status: 500 });
  }
}
