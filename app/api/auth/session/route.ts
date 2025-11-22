import { NextResponse } from 'next/server';
import { getSession, refreshSession } from '@/lib/cookie';

export async function GET() {
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

  return NextResponse.json({
    keyType: refreshed.keyType,
    expiresAt: refreshed.expiresAt,
  });
}

