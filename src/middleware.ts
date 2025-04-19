import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip authentication for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for API routes that need authentication
  if (pathname.startsWith('/api/')) {
    return handleApiAuthentication(request);
  }

  // For non-API routes, check for authentication token in cookies
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirect to login page for non-authenticated users
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    const decoded = await verifyToken(token);
    
    // Add the verified user info to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    if (decoded.email) requestHeaders.set('x-user-email', decoded.email);
    if (decoded.role) requestHeaders.set('x-user-role', decoded.role);

    // Clone the request with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Handle API authentication
async function handleApiAuthentication(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      }
    );
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the JWT token
    const decoded = await verifyToken(token);

    // Add the verified user info to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    if (decoded.email) requestHeaders.set('x-user-email', decoded.email);
    if (decoded.role) requestHeaders.set('x-user-role', decoded.role);

    // Clone the request with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      }
    );
  }
}

// Configure protected routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 