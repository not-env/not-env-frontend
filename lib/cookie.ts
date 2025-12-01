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
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  return await decryptSession(sessionCookie.value);
}

export async function setSession(data: Omit<SessionData, 'expiresAt'>): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionData: SessionData = { ...data, expiresAt };
  const token = await encryptSession(sessionData);
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour in seconds
    path: '/',
  });
}

export async function refreshSession(): Promise<SessionData | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  // Update expiration to 1 hour from now
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  // Re-encrypt with new expiration
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionData: SessionData = { 
    apiKey: session.apiKey, 
    keyType: session.keyType,
    expiresAt 
  };
  
  const token = await encryptSession(sessionData);
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour in seconds
    path: '/',
  });
  
  return sessionData;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

