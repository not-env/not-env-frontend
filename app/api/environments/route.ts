import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { listEnvironments, createEnvironment, deleteEnvironment } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  
  if (!session || session.keyType !== 'APP_ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'APP_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const environments = await listEnvironments(session.apiKey);
    return NextResponse.json({ environments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch environments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session || session.keyType !== 'APP_ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'APP_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = await createEnvironment(session.apiKey, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Bad Request', message: error instanceof Error ? error.message : 'Failed to create environment' },
      { status: 400 }
    );
  }
}

