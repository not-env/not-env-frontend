import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Session refresh is handled by the pages themselves
  // This middleware can be extended for other purposes (rate limiting, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/environment/:path*'],
};

