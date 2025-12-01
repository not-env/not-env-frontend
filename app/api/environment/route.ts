import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { getEnvironment } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const environment = await getEnvironment(session.apiKey);
    return NextResponse.json(environment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch environment' },
      { status: 500 }
    );
  }
}

