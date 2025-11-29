import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { listVariables, setVariable } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const variables = await listVariables(session.apiKey);
    return NextResponse.json({ variables });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch variables' },
      { status: 500 }
    );
  }
}

