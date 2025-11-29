import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { getVariable, setVariable, deleteVariable } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const decodedKey = decodeURIComponent(params.key);
    const variable = await getVariable(session.apiKey, decodedKey);
    return NextResponse.json(variable);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to fetch variable' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const session = await getSession();
  
  if (!session || session.keyType === 'ENV_READ_ONLY') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'ENV_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const decodedKey = decodeURIComponent(params.key);
    console.log('[Variables API] PUT request for key:', decodedKey);
    console.log('[Variables API] Session info:', {
      keyType: session.keyType,
      hasApiKey: !!session.apiKey,
      apiKeyPreview: session.apiKey ? `${session.apiKey.substring(0, 10)}...` : 'none',
    });
    
    const body = await request.json();
    console.log('[Variables API] Request body:', {
      hasValue: !!body.value,
      valueType: typeof body.value,
      valueLength: body.value ? String(body.value).length : 0,
      valuePreview: body.value ? String(body.value).substring(0, 50) : 'none',
    });
    
    if (!body.value) {
      console.log('[Variables API] Invalid body - value missing');
      return NextResponse.json(
        { error: 'Bad Request', message: 'value is required' },
        { status: 400 }
      );
    }

    // Ensure value is a string
    const stringValue = String(body.value);
    
    if (stringValue === '') {
      console.log('[Variables API] Invalid body - value is empty string');
      return NextResponse.json(
        { error: 'Bad Request', message: 'value cannot be empty' },
        { status: 400 }
      );
    }

    console.log('[Variables API] Calling setVariable with:', {
      key: decodedKey,
      valueLength: stringValue.length,
      keyType: session.keyType,
    });
    
    await setVariable(session.apiKey, decodedKey, stringValue);
    console.log('[Variables API] Variable set successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Variables API] Error setting variable:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
    });
    
    // If it's a decryption error from the backend, return a more helpful message
    const errorMessage = error instanceof Error ? error.message : 'Failed to set variable';
    if (errorMessage.includes('decryption error')) {
      console.error('[Variables API] Backend decryption error - this is a backend issue.');
      console.error('[Variables API] Possible causes:');
      console.error('  1. Master key (NOT_ENV_MASTER_KEY) changed or incorrect');
      console.error('  2. Organization DEK was encrypted with a different master key');
      console.error('  3. Database corruption or organization data issue');
      console.error('[Variables API] Note: Reading variables works, so DEK decryption should work too.');
      console.error('[Variables API] This suggests a backend bug or configuration issue.');
      
      return NextResponse.json(
        { 
          error: 'Internal Server Error', 
          message: 'Backend decryption error. This appears to be a backend configuration issue. Please check backend logs. Reading variables works, so the master key should be correct - this may be a backend bug.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Bad Request', message: errorMessage },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const session = await getSession();
  
  if (!session || session.keyType === 'ENV_READ_ONLY') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'ENV_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const decodedKey = decodeURIComponent(params.key);
    await deleteVariable(session.apiKey, decodedKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to delete variable' },
      { status: 500 }
    );
  }
}

