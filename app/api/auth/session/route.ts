import { NextResponse } from 'next/server';
import { getSession, refreshSession } from '@/lib/cookie';

export async function GET(request: Request) {
  console.log('[Session API] GET /api/auth/session called at', new Date().toISOString());
  const session = await getSession();
  
  console.log('[Session API] Raw session from cookie:', session ? {
    keyType: session.keyType,
    apiKey: session.apiKey ? `${session.apiKey.substring(0, 10)}...` : 'none',
    expiresAt: new Date(session.expiresAt).toISOString(),
  } : 'null');
  
  if (!session) {
    console.log('[Session API] No session found, returning 401');
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No active session' },
      { status: 401 }
    );
  }

  // Refresh the session expiration
  const refreshed = await refreshSession();
  
  console.log('[Session API] Refreshed session:', refreshed ? {
    keyType: refreshed.keyType,
    expiresAt: new Date(refreshed.expiresAt).toISOString(),
  } : 'null');
  
  if (!refreshed) {
    console.log('[Session API] Session refresh failed, returning 401');
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
  
  console.log('[Session API] Returning response:', responseData);
  
  const response = NextResponse.json(responseData);
  
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

