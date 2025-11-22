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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          No environments found. Create your first environment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          All Environments
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {environments.map((env) => (
              <tr key={env.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  {env.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  {env.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {env.description || <span className="text-slate-400 dark:text-slate-500 italic">No description</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(env.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(env.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(env.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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

