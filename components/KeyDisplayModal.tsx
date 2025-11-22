'use client';

import { useState } from 'react';
import { CreateEnvironmentResponse } from '@/lib/api';

interface KeyDisplayModalProps {
  environment: CreateEnvironmentResponse;
  onClose: () => void;
}

export default function KeyDisplayModal({
  environment,
  onClose,
}: KeyDisplayModalProps) {
  const [copied, setCopied] = useState<'env_admin' | 'env_read_only' | null>(null);

  const copyToClipboard = async (text: string, type: 'env_admin' | 'env_read_only') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Environment Created Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Save these API keys securely. They will not be shown again.
          </p>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Important: Copy these keys now. They cannot be retrieved later.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Environment Details
            </label>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">ID:</span>
                <span className="text-slate-900 dark:text-white font-mono">{environment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Name:</span>
                <span className="text-slate-900 dark:text-white">{environment.name}</span>
              </div>
              {environment.description && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Description:</span>
                  <span className="text-slate-900 dark:text-white">{environment.description}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ENV_ADMIN Key
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={environment.keys.env_admin}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(environment.keys.env_admin, 'env_admin')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {copied === 'env_admin' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Full access to manage variables in this environment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ENV_READ_ONLY Key
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={environment.keys.env_read_only}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(environment.keys.env_read_only, 'env_read_only')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {copied === 'env_read_only' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Read-only access to view variables in this environment
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            I've Saved the Keys
          </button>
        </div>
      </div>
    </div>
  );
}

