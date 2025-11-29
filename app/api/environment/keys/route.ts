import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { getEnvironmentKeys } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  
  if (!session || session.keyType !== 'ENV_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'ENV_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const keys = await getEnvironmentKeys(session.apiKey);
    return NextResponse.json(keys);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch keys' },
      { status: 500 }
    );
  }
}

