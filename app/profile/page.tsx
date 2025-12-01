'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserMenu from '@/components/UserMenu';
import BrandName from '@/components/BrandName';

interface UserInfo {
  key_type: string;
  organization_id: number;
  environment_id?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [keyType, setKeyType] = useState<'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session info
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/');
        return;
      }
      const session = await sessionRes.json();
      setKeyType(session.keyType);

      // Get user info from backend
      const userRes = await fetch('/api/me');
      if (!userRes.ok) {
        throw new Error('Failed to load user information');
      }
      const userData = await userRes.json();
      setUserInfo(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFCF8' }}>
        <div style={{ color: '#6B6B6B' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFCF8' }}>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
          <p style={{ color: '#B54848' }}>{error}</p>
        </div>
      </div>
    );
  }

  const getKeyTypeLabel = () => {
    if (keyType === 'APP_ADMIN') return 'App Admin';
    if (keyType === 'ENV_ADMIN') return 'Environment Admin';
    return 'Read Only';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEFCF8' }}>
      <nav className="bg-white border-b" style={{ borderColor: '#E8E6E1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BrandName showSubtitle subtitle="Profile" />
            </div>
            <div className="flex items-center">
              <UserMenu keyType={keyType || undefined} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6" style={{ borderColor: '#E8E6E1' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C2C2C' }}>
            User Profile
          </h2>

          {userInfo && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B6B6B' }}>
                  Key Type
                </label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAF8F3' }}>
                  <p className="font-semibold" style={{ color: '#2C2C2C' }}>
                    {getKeyTypeLabel()}
                  </p>
                  <p className="text-sm font-mono mt-1" style={{ color: '#9A9A9A' }}>
                    {userInfo.key_type}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B6B6B' }}>
                  Organization ID
                </label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAF8F3' }}>
                  <p className="font-mono" style={{ color: '#2C2C2C' }}>
                    {userInfo.organization_id}
                  </p>
                </div>
              </div>

              {userInfo.environment_id && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B6B6B' }}>
                    Environment ID
                  </label>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAF8F3' }}>
                    <p className="font-mono" style={{ color: '#2C2C2C' }}>
                      {userInfo.environment_id}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t" style={{ borderColor: '#E8E6E1' }}>
                <p className="text-sm" style={{ color: '#9A9A9A' }}>
                  This is your account information. Use the menu in the top right to switch accounts or logout.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

