'use client';

import { useState } from 'react';

interface CreateVariableModalProps {
  onClose: () => void;
  onSubmit: (key: string, value: string) => Promise<void>;
  existingKeys: string[];
}

export default function CreateVariableModal({
  onClose,
  onSubmit,
  existingKeys,
}: CreateVariableModalProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim()) {
      setError('Key is required');
      return;
    }

    if (existingKeys.includes(key.trim())) {
      setError('A variable with this key already exists');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(key.trim(), value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create variable');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>
            Create Variable
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
              htmlFor="key"
              className="block text-sm font-medium mb-2"
              style={{ color: '#2C2C2C' }}
            >
              Key <span style={{ color: '#C85A5A' }}>*</span>
            </label>
            <input
              id="key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors font-mono"
              style={{ 
                borderColor: '#E8E6E1',
                backgroundColor: '#FFFFFF',
                color: '#2C2C2C',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#5B8DB8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8E6E1'}
              placeholder="VARIABLE_NAME"
              disabled={loading}
            />
            <p className="mt-1 text-xs" style={{ color: '#9A9A9A' }}>
              Variable names are case-sensitive
            </p>
          </div>

          <div>
            <label
              htmlFor="value"
              className="block text-sm font-medium mb-2"
              style={{ color: '#2C2C2C' }}
            >
              Value <span style={{ color: '#C85A5A' }}>*</span>
            </label>
            <textarea
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors font-mono"
              style={{ 
                borderColor: '#E8E6E1',
                backgroundColor: '#FFFFFF',
                color: '#2C2C2C',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#5B8DB8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8E6E1'}
              placeholder="variable value"
              disabled={loading}
            />
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
              disabled={loading || !key.trim() || !value.trim()}
              className="px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading || !key.trim() || !value.trim() ? '#9A9A9A' : '#5B8DB8' }}
              onMouseEnter={(e) => {
                if (!loading && key.trim() && value.trim()) {
                  e.currentTarget.style.backgroundColor = '#4A7BA5';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && key.trim() && value.trim()) {
                  e.currentTarget.style.backgroundColor = '#5B8DB8';
                }
              }}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

