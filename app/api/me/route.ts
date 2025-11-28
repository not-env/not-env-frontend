import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { apiRequest } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const userInfo = await apiRequest<{
      key_type: string;
      organization_id: number;
      environment_id?: number;
    }>('/me', {
      method: 'GET',
      apiKey: session.apiKey,
    });
    
    return NextResponse.json(userInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}

