import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'proposta_session';

const protectedPaths = ['/dashboard', '/propostas', '/templates', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/propostas/:path*',
    '/templates/:path*',
    '/settings/:path*',
  ],
};
