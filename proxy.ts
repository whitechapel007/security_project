import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'artistshield-dev-secret-32chars!!'
);

const PROTECTED_PAGES = ['/dashboard'];
const PROTECTED_API = ['/api/threats', '/api/risk', '/api/simulation', '/api/logs', '/api/metrics', '/api/users'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API.some(p => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const token = req.cookies.get('as_session')?.value;

  if (!token) {
    if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (isProtectedPage && (payload as { status?: string }).status === 'suspended') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch {
    if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const res = NextResponse.redirect(new URL('/', req.url));
    res.cookies.delete('as_session');
    return res;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/threats/:path*', '/api/risk/:path*', '/api/simulation/:path*', '/api/logs/:path*', '/api/metrics/:path*', '/api/users/:path*'],
};
