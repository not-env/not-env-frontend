'use client';

import { Environment } from '@/lib/api';

interface EnvironmentListProps {
  environments: Environment[];
  onDelete: (id: number) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function EnvironmentList({
  environments,
  onDelete,
  refreshing = false,
  onRefresh,
}: EnvironmentListProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (environments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center" style={{ borderColor: '#E8E6E1' }}>
        <p className="mb-4" style={{ color: '#6B6B6B' }}>
          No environments found. Create your first environment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ borderColor: '#E8E6E1' }}>
      <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E8E6E1' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#2C2C2C' }}>
          All Environments
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3 py-1 text-sm rounded transition-colors disabled:opacity-50"
            style={{ color: '#6B6B6B' }}
            onMouseEnter={(e) => !refreshing && (e.currentTarget.style.color = '#2C2C2C')}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B6B6B'}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: '#E8E6E1' }}>
          <thead style={{ backgroundColor: '#FAF8F3' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: '#E8E6E1' }}>
            {environments.map((env) => (
              <tr 
                key={env.id} 
                className="transition-colors"
                style={{ 
                  borderColor: '#E8E6E1',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#2C2C2C' }}>
                  {env.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2C2C2C' }}>
                  {env.name}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: '#6B6B6B' }}>
                  {env.description || <span className="italic" style={{ color: '#9A9A9A' }}>No description</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B6B6B' }}>
                  {formatDate(env.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B6B6B' }}>
                  {formatDate(env.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(env.id)}
                    className="transition-colors"
                    style={{ color: '#C85A5A' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#B54848'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C85A5A'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

