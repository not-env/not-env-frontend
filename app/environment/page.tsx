'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';

export default function EnvironmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refresh session on user activity
  useSessionRefresh();

  useEffect(() => {
    // Check session and refresh it
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          router.push('/');
          return;
        }

        const data = await response.json();
        
        if (data.keyType === 'APP_ADMIN') {
          // Wrong page for this key type
          router.push('/app');
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to verify session');
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Not-Env - Environment
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Environment Variables
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Environment management interface - coming soon
          </p>
        </div>
      </main>
    </div>
  );
}

