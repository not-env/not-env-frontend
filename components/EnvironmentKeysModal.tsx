'use client';

import { useState, useEffect } from 'react';

interface EnvironmentKeysModalProps {
  onClose: () => void;
}

export default function EnvironmentKeysModal({ onClose }: EnvironmentKeysModalProps) {
  const [keys, setKeys] = useState<{ env_admin: string; env_read_only: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'env_admin' | 'env_read_only' | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/environment/keys');
      if (!res.ok) {
        throw new Error('Failed to load keys');
      }
      const data = await res.json();
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'env_admin' | 'env_read_only') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>
            Environment API Keys
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

        {loading && (
          <div className="text-center py-8" style={{ color: '#6B6B6B' }}>
            Loading keys...
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg border mb-4" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
            <p className="text-sm" style={{ color: '#B54848' }}>{error}</p>
          </div>
        )}

        {keys && !loading && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F5EDE3', borderColor: '#D4A574' }}>
              <p className="text-sm" style={{ color: '#C49564' }}>
                ⚠️ Note: The backend only stores key hashes. Actual keys can only be viewed when an environment is first created.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>
                ENV_ADMIN Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={keys.env_admin}
                  className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                  style={{ 
                    borderColor: '#E8E6E1',
                    backgroundColor: '#FAF8F3',
                    color: '#2C2C2C',
                  }}
                />
                <button
                  onClick={() => copyToClipboard(keys.env_admin, 'env_admin')}
                  className="px-4 py-2 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                  style={{ backgroundColor: copied === 'env_admin' ? '#6B9B7A' : '#5B8DB8' }}
                  onMouseEnter={(e) => {
                    if (copied !== 'env_admin') {
                      e.currentTarget.style.backgroundColor = '#4A7BA5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (copied !== 'env_admin') {
                      e.currentTarget.style.backgroundColor = '#5B8DB8';
                    }
                  }}
                >
                  {copied === 'env_admin' ? '✅ Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 text-xs" style={{ color: '#9A9A9A' }}>
                Full access to manage variables in this environment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>
                ENV_READ_ONLY Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={keys.env_read_only}
                  className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                  style={{ 
                    borderColor: '#E8E6E1',
                    backgroundColor: '#FAF8F3',
                    color: '#2C2C2C',
                  }}
                />
                <button
                  onClick={() => copyToClipboard(keys.env_read_only, 'env_read_only')}
                  className="px-4 py-2 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                  style={{ backgroundColor: copied === 'env_read_only' ? '#6B9B7A' : '#5B8DB8' }}
                  onMouseEnter={(e) => {
                    if (copied !== 'env_read_only') {
                      e.currentTarget.style.backgroundColor = '#4A7BA5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (copied !== 'env_read_only') {
                      e.currentTarget.style.backgroundColor = '#5B8DB8';
                    }
                  }}
                >
                  {copied === 'env_read_only' ? '✅ Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 text-xs" style={{ color: '#9A9A9A' }}>
                Read-only access to view variables in this environment
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t" style={{ borderColor: '#E8E6E1' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#5B8DB8' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A7BA5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B8DB8'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

