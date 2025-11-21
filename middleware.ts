import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const url = request.nextUrl.pathname;

  // 1. Jika belum login, tendang ke /login
  if (!token && url !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika sudah login tapi akses /login, kembalikan ke dashboard masing-masing
  if (token && url === '/login') {
    if (role === 'admin_platform') return NextResponse.redirect(new URL('/platform', request.url));
    if (role === 'super_admin') return NextResponse.redirect(new URL('/mitra', request.url));
    if (role === 'branch_admin') return NextResponse.redirect(new URL('/branch', request.url));
  }

  // 3. Proteksi Role (Role-Based Access Control)
  if (url.startsWith('/platform') && role !== 'admin_platform') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (url.startsWith('/mitra') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (url.startsWith('/branch') && role !== 'branch_admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/platform/:path*', '/mitra/:path*', '/branch/:path*', '/login'],
};