import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface SessionData {
  apiKey: string;
  keyType: 'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY';
  expiresAt: number;
}

const secret = new TextEncoder().encode(SESSION_SECRET);

export async function encryptSession(data: SessionData): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;
  
  return await new SignJWT({ ...data, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(secret);
}

export async function decryptSession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      return null; // Expired
    }
    
    return {
      apiKey: payload.apiKey as string,
      keyType: payload.keyType as SessionData['keyType'],
      expiresAt: (payload.expiresAt as number) || payload.exp! * 1000,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  console.log('[Cookie] getSession called, cookie exists:', !!sessionCookie?.value);
  
  if (!sessionCookie?.value) {
    console.log('[Cookie] No session cookie found');
    return null;
  }
  
  const decrypted = await decryptSession(sessionCookie.value);
  console.log('[Cookie] Decrypted session:', decrypted ? {
    keyType: decrypted.keyType,
    apiKey: decrypted.apiKey ? `${decrypted.apiKey.substring(0, 10)}...` : 'none',
    expiresAt: new Date(decrypted.expiresAt).toISOString(),
  } : 'null');
  
  return decrypted;
}

export async function setSession(data: Omit<SessionData, 'expiresAt'>): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionData: SessionData = { ...data, expiresAt };
  console.log('[Cookie] Setting session with data:', {
    keyType: sessionData.keyType,
    apiKey: sessionData.apiKey ? `${sessionData.apiKey.substring(0, 10)}...` : 'none',
    expiresAt: new Date(expiresAt).toISOString(),
  });
  const token = await encryptSession(sessionData);
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour in seconds
    path: '/',
  });
  console.log('[Cookie] Session cookie set successfully');
}

export async function refreshSession(): Promise<SessionData | null> {
  const session = await getSession();
  
  console.log('[Cookie] refreshSession called, current session:', session ? {
    keyType: session.keyType,
    expiresAt: new Date(session.expiresAt).toISOString(),
  } : 'null');
  
  if (!session) {
    console.log('[Cookie] No session to refresh');
    return null;
  }
  
  // Update expiration to 1 hour from now
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie?.value) {
    console.log('[Cookie] No session cookie found');
    return null;
  }
  
  // Re-encrypt with new expiration
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionData: SessionData = { 
    apiKey: session.apiKey, 
    keyType: session.keyType,
    expiresAt 
  };
  
  console.log('[Cookie] Refreshing session with keyType:', sessionData.keyType);
  
  const token = await encryptSession(sessionData);
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour in seconds
    path: '/',
  });
  
  console.log('[Cookie] Session refreshed successfully');
  
  return sessionData;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

