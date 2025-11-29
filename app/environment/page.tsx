'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Variable } from '@/lib/api';
import VariableList from '@/components/VariableList';
import CreateVariableModal from '@/components/CreateVariableModal';
import EditVariableModal from '@/components/EditVariableModal';
import UserMenu from '@/components/UserMenu';
import BrandName from '@/components/BrandName';

export default function EnvironmentPage() {
  const router = useRouter();
  const [variables, setVariables] = useState<Variable[]>([]);
  const [environment, setEnvironment] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [keyType, setKeyType] = useState<'ENV_ADMIN' | 'ENV_READ_ONLY' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load environment info
      const envRes = await fetch('/api/environment');
      if (envRes.status === 401) {
        router.push('/');
        return;
      }
      if (!envRes.ok) {
        throw new Error('Failed to load environment');
      }
      const envData = await envRes.json();
      setEnvironment(envData);

      // Load key type from session
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setKeyType(session.keyType);
      }

      // Load variables
      await refreshVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshVariables = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/variables');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load variables');
      }
      const data = await res.json();
      setVariables(data.variables || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh variables');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreate = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/variables/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create variable');
      }

      setShowCreateModal(false);
      await refreshVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create variable');
    }
  };

  const handleEdit = (variable: Variable) => {
    setEditingVariable(variable);
    setShowEditModal(true);
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/variables/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update variable');
      }

      setShowEditModal(false);
      setEditingVariable(null);
      await refreshVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update variable');
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const res = await fetch(`/api/variables/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete variable');
      }

      await refreshVariables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete variable');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFCF8' }}>
        <div style={{ color: '#6B6B6B' }}>Loading...</div>
      </div>
    );
  }

  const isAdmin = keyType === 'ENV_ADMIN';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEFCF8' }}>
      <nav className="bg-white border-b" style={{ borderColor: '#E8E6E1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BrandName showSubtitle subtitle={environment?.name || 'Environment'} />
              {environment?.description && (
                <span className="ml-3 text-sm" style={{ color: '#6B6B6B' }}>
                  {environment.description}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <UserMenu keyType={keyType || undefined} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#2C2C2C' }}>
              Environment Variables
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#6B6B6B' }}>
              {isAdmin
                ? 'Manage environment variables. Add, edit, or delete variables as needed.'
                : 'View environment variables. You have read-only access.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#5B8DB8' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A7BA5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B8DB8'}
            >
              Add Variable
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
            <p className="text-sm" style={{ color: '#B54848' }}>{error}</p>
          </div>
        )}

        <VariableList
          variables={variables}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={refreshVariables}
          refreshing={refreshing}
        />

        {showCreateModal && (
          <CreateVariableModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreate}
            existingKeys={variables.map((v) => v.key)}
          />
        )}

        {showEditModal && editingVariable && (
          <EditVariableModal
            variable={editingVariable}
            onClose={() => {
              setShowEditModal(false);
              setEditingVariable(null);
            }}
            onSubmit={handleUpdate}
          />
        )}
      </main>
    </div>
  );
}
