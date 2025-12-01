import { NextResponse } from 'next/server';
import { getSession, refreshSession } from '@/lib/cookie';

export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No active session' },
      { status: 401 }
    );
  }

  // Refresh the session expiration
  const refreshed = await refreshSession();
  
  if (!refreshed) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Session expired' },
      { status: 401 }
    );
  }

  // Return response with no-cache headers to prevent browser caching
  const responseData = {
    keyType: refreshed.keyType,
    expiresAt: refreshed.expiresAt,
  };
  
  const response = NextResponse.json(responseData);
  
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

