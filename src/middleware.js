import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Check if the user is authenticated
  const authToken = request.cookies.get('authToken')?.value;

  // Define auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*'
  ]
}; 