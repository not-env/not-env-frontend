'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate API key');
      }

      // Redirect based on key type
      if (data.keyType === 'APP_ADMIN') {
        router.push('/app');
      } else {
        router.push('/environment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Not-Env
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter your API key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Enter your API key"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Your API key is encrypted and stored securely in a session cookie
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Need help? Check the documentation for API key types:
            <br />
            <span className="font-mono text-xs">APP_ADMIN</span>,{' '}
            <span className="font-mono text-xs">ENV_ADMIN</span>, or{' '}
            <span className="font-mono text-xs">ENV_READ_ONLY</span>
          </p>
        </div>
      </div>
    </div>
  );
}

