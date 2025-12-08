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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2C2C2C' }}>
            Environment Created Successfully!
          </h2>
          <p style={{ color: '#6B6B6B' }}>
            Save these API keys securely. They will not be shown again.
          </p>
        </div>

        <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: '#F5EDE3', borderColor: '#D4A574' }}>
          <p className="text-sm font-medium" style={{ color: '#C49564' }}>
            ⚠️ Important: Copy these keys now. They cannot be retrieved later.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>
              Environment Details
            </label>
            <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#FAF8F3' }}>
              <div className="flex justify-between">
                <span style={{ color: '#6B6B6B' }}>ID:</span>
                <span className="font-mono" style={{ color: '#2C2C2C' }}>{environment.id}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B6B6B' }}>Name:</span>
                <span style={{ color: '#2C2C2C' }}>{environment.name}</span>
              </div>
              {environment.description && (
                <div className="flex justify-between">
                  <span style={{ color: '#6B6B6B' }}>Description:</span>
                  <span style={{ color: '#2C2C2C' }}>{environment.description}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>
              ENV_ADMIN Key
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={environment.keys.env_admin}
                className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                style={{ 
                  borderColor: '#E8E6E1',
                  backgroundColor: '#FAF8F3',
                  color: '#2C2C2C',
                }}
              />
              <button
                onClick={() => copyToClipboard(environment.keys.env_admin, 'env_admin')}
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
                value={environment.keys.env_read_only}
                className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                style={{ 
                  borderColor: '#E8E6E1',
                  backgroundColor: '#FAF8F3',
                  color: '#2C2C2C',
                }}
              />
              <button
                onClick={() => copyToClipboard(environment.keys.env_read_only, 'env_read_only')}
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

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#5B8DB8' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A7BA5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B8DB8'}
          >
            I&apos;ve Saved the Keys
          </button>
        </div>
      </div>
    </div>
  );
}

