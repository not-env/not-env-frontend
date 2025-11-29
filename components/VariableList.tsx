'use client';

import { useState } from 'react';
import { Variable } from '@/lib/api';
import DeleteVariableModal from './DeleteVariableModal';

interface VariableListProps {
  variables: Variable[];
  isAdmin: boolean;
  onEdit: (variable: Variable) => void;
  onDelete: (key: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function VariableList({
  variables,
  isAdmin,
  onEdit,
  onDelete,
  onRefresh,
  refreshing = false,
}: VariableListProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [fadingKey, setFadingKey] = useState<string | null>(null);
  const [fadingValue, setFadingValue] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: 'key' | 'value', identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Set copied state
      if (type === 'key') {
        setCopiedKey(identifier);
        setFadingKey(null);
        setTimeout(() => {
          setFadingKey(identifier);
          setTimeout(() => {
            setCopiedKey(null);
            setFadingKey(null);
          }, 1000); // Fade out duration
        }, 2000); // Show checkmark for 2 seconds
      } else {
        setCopiedValue(identifier);
        setFadingValue(null);
        setTimeout(() => {
          setFadingValue(identifier);
          setTimeout(() => {
            setCopiedValue(null);
            setFadingValue(null);
          }, 1000); // Fade out duration
        }, 2000); // Show checkmark for 2 seconds
      }
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
      
      // Set copied state even for fallback
      if (type === 'key') {
        setCopiedKey(identifier);
        setFadingKey(null);
        setTimeout(() => {
          setFadingKey(identifier);
          setTimeout(() => {
            setCopiedKey(null);
            setFadingKey(null);
          }, 1000); // Fade out duration
        }, 2000); // Show checkmark for 2 seconds
      } else {
        setCopiedValue(identifier);
        setFadingValue(null);
        setTimeout(() => {
          setFadingValue(identifier);
          setTimeout(() => {
            setCopiedValue(null);
            setFadingValue(null);
          }, 1000); // Fade out duration
        }, 2000); // Show checkmark for 2 seconds
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (variables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center" style={{ borderColor: '#E8E6E1' }}>
        <p className="mb-4" style={{ color: '#6B6B6B' }}>
          No variables found. {isAdmin && 'Create your first variable to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ borderColor: '#E8E6E1' }}>
      <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E8E6E1' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#2C2C2C' }}>
          Variables ({variables.length})
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
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B6B6B' }}>
                Value
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
            {variables.map((variable) => (
              <tr
                key={variable.key}
                className="transition-colors"
                style={{ borderColor: '#E8E6E1' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium font-mono" style={{ color: '#2C2C2C' }}>
                      {variable.key}
                    </span>
                    <button
                      onClick={() => copyToClipboard(variable.key, 'key', variable.key)}
                      className="ml-2 text-xs flex-shrink-0 relative"
                      style={{ 
                        color: copiedKey === variable.key ? '#6B9B7A' : '#5B8DB8',
                        minWidth: '16px',
                        minHeight: '16px',
                      }}
                      onMouseEnter={(e) => {
                        if (copiedKey !== variable.key) {
                          e.currentTarget.style.color = '#4A7BA5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (copiedKey !== variable.key) {
                          e.currentTarget.style.color = '#5B8DB8';
                        }
                      }}
                      title={copiedKey === variable.key ? 'Copied!' : 'Copy key'}
                    >
                      <span
                        style={{
                          opacity: copiedKey === variable.key && fadingKey !== variable.key ? 1 : 0,
                          transition: 'opacity 1s ease-in-out',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                        }}
                      >
                        ✅
                      </span>
                      <span
                        style={{
                          opacity: copiedKey !== variable.key || fadingKey === variable.key ? 1 : 0,
                          transition: 'opacity 1s ease-in-out',
                        }}
                      >
                        📋
                      </span>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center max-w-md">
                    <span className="text-sm font-mono truncate" style={{ color: '#6B6B6B' }}>
                      {variable.value}
                    </span>
                    <button
                      onClick={() => copyToClipboard(variable.value, 'value', variable.key)}
                      className="ml-2 text-xs flex-shrink-0 relative"
                      style={{ 
                        color: copiedValue === variable.key ? '#6B9B7A' : '#5B8DB8',
                        minWidth: '16px',
                        minHeight: '16px',
                      }}
                      onMouseEnter={(e) => {
                        if (copiedValue !== variable.key) {
                          e.currentTarget.style.color = '#4A7BA5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (copiedValue !== variable.key) {
                          e.currentTarget.style.color = '#5B8DB8';
                        }
                      }}
                      title={copiedValue === variable.key ? 'Copied!' : 'Copy value'}
                    >
                      <span
                        style={{
                          opacity: copiedValue === variable.key && fadingValue !== variable.key ? 1 : 0,
                          transition: 'opacity 1s ease-in-out',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                        }}
                      >
                        ✅
                      </span>
                      <span
                        style={{
                          opacity: copiedValue !== variable.key || fadingValue === variable.key ? 1 : 0,
                          transition: 'opacity 1s ease-in-out',
                        }}
                      >
                        📋
                      </span>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#6B6B6B' }}>
                  {formatDate(variable.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-3">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(variable)}
                          className="px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                          style={{ backgroundColor: '#5B8DB8' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A7BA5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B8DB8'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setVariableToDelete(variable.key);
                            setDeleteModalOpen(true);
                          }}
                          className="px-2 py-1.5 text-lg transition-colors rounded"
                          style={{ color: '#C85A5A' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#B54848'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#C85A5A'}
                          title="Delete variable"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteVariableModal
        isOpen={deleteModalOpen}
        variableKey={variableToDelete || ''}
        onClose={() => {
          setDeleteModalOpen(false);
          setVariableToDelete(null);
        }}
        onConfirm={() => {
          if (variableToDelete) {
            onDelete(variableToDelete);
            setDeleteModalOpen(false);
            setVariableToDelete(null);
          }
        }}
      />
    </div>
  );
}

