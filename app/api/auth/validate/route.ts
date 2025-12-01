import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api';
import { setSession } from '@/lib/cookie';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate the API key and determine its type
    const keyInfo = await validateApiKey(apiKey);

    // Set encrypted session cookie
    await setSession({
      apiKey,
      keyType: keyInfo.keyType,
    });

    return NextResponse.json({
      keyType: keyInfo.keyType,
      environmentId: keyInfo.environmentId,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}

