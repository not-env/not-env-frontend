'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';
import { Environment, CreateEnvironmentResponse } from '@/lib/api';
import EnvironmentList from '@/components/EnvironmentList';
import CreateEnvironmentModal from '@/components/CreateEnvironmentModal';
import KeyDisplayModal from '@/components/KeyDisplayModal';

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [newEnvironmentKeys, setNewEnvironmentKeys] = useState<CreateEnvironmentResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Refresh session on user activity
  useSessionRefresh();

  const loadEnvironments = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/environments');
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load environments');
      }

      const data = await response.json();
      setEnvironments(data.environments || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load environments');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

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
        
        if (data.keyType !== 'APP_ADMIN') {
          // Wrong page for this key type
          router.push('/environment');
          return;
        }

        // Load environments after session is verified
        await loadEnvironments();
      } catch (err) {
        setError('Failed to verify session');
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleCreateEnvironment = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create environment');
      }

      const result: CreateEnvironmentResponse = await response.json();
      setNewEnvironmentKeys(result);
      setShowCreateModal(false);
      setShowKeysModal(true);
      await loadEnvironments(); // Refresh the list
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleDeleteEnvironment = async (id: number) => {
    if (!confirm(`Are you sure you want to delete environment ${id}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/environments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete environment');
      }

      await loadEnvironments(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete environment');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
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
                Not-Env - App Admin
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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Environments
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Create Environment
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <EnvironmentList
          environments={environments}
          onDelete={handleDeleteEnvironment}
          refreshing={refreshing}
          onRefresh={loadEnvironments}
        />

        {showCreateModal && (
          <CreateEnvironmentModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateEnvironment}
          />
        )}

        {showKeysModal && newEnvironmentKeys && (
          <KeyDisplayModal
            environment={newEnvironmentKeys}
            onClose={() => {
              setShowKeysModal(false);
              setNewEnvironmentKeys(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

