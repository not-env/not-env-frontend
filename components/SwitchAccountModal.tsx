'use client';

import { useState } from 'react';

interface SwitchAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SwitchAccountModal({ onClose, onSuccess }: SwitchAccountModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate the new API key
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid API key');
      }

      // If validation succeeds, the session is already updated
      // Wait a moment to ensure cookie is set, then force a hard reload
      await new Promise(resolve => setTimeout(resolve, 200));
      // Force a hard reload to clear all caches
      window.location.href = window.location.href;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>
            Switch Account
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#9A9A9A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#6B6B6B'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9A9A9A'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium mb-2"
              style={{ color: '#2C2C2C' }}
            >
              New API Key
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
              autoFocus
            />
            <p className="mt-2 text-xs" style={{ color: '#9A9A9A' }}>
              Enter a new API key to switch accounts. Your session will be updated.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
              <p className="text-sm" style={{ color: '#B54848' }}>{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: '#6B6B6B', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#FAF8F3')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading || !apiKey.trim() ? '#9A9A9A' : '#5B8DB8' }}
              onMouseEnter={(e) => {
                if (!loading && apiKey.trim()) {
                  e.currentTarget.style.backgroundColor = '#4A7BA5';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && apiKey.trim()) {
                  e.currentTarget.style.backgroundColor = '#5B8DB8';
                }
              }}
            >
              {loading ? 'Switching...' : 'Switch Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

