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
    const body = await request.json();
    
    if (!body.value) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'value is required' },
        { status: 400 }
      );
    }

    // Ensure value is a string
    const stringValue = String(body.value);
    
    if (stringValue === '') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'value cannot be empty' },
        { status: 400 }
      );
    }
    
    await setVariable(session.apiKey, decodedKey, stringValue);
    return NextResponse.json({ success: true });
  } catch (error) {
    // If it's a decryption error from the backend, return a more helpful message
    const errorMessage = error instanceof Error ? error.message : 'Failed to set variable';
    if (errorMessage.includes('decryption error')) {
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

