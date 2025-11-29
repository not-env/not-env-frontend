'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFCF8' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl" style={{ borderColor: '#E8E6E1' }}>
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="medium" />
          </div>
          <p style={{ color: '#6B6B6B' }}>
            Enter your API key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium mb-2"
              style={{ color: '#2C2C2C' }}
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors"
              style={{ 
                borderColor: '#E8E6E1',
                backgroundColor: '#FFFFFF',
                color: '#2C2C2C',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#5B8DB8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8E6E1'}
              placeholder="Enter your API key"
              disabled={loading}
            />
            <p className="mt-2 text-xs" style={{ color: '#9A9A9A' }}>
              Your API key is encrypted and stored securely in a session cookie
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
              <p className="text-sm" style={{ color: '#B54848' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full py-2 px-4 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: loading || !apiKey ? '#9A9A9A' : '#5B8DB8' }}
            onMouseEnter={(e) => {
              if (!loading && apiKey) {
                e.currentTarget.style.backgroundColor = '#4A7BA5';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && apiKey) {
                e.currentTarget.style.backgroundColor = '#5B8DB8';
              }
            }}
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E8E6E1' }}>
          <p className="text-xs text-center" style={{ color: '#9A9A9A' }}>
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

