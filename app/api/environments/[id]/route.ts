import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cookie';
import { deleteEnvironment } from '@/lib/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  
  if (!session || session.keyType !== 'APP_ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'APP_ADMIN permission required' },
      { status: 403 }
    );
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid environment ID' },
        { status: 400 }
      );
    }

    await deleteEnvironment(session.apiKey, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Failed to delete environment' },
      { status: 500 }
    );
  }
}

