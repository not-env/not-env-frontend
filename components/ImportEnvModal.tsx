'use client';

import { useState, useRef } from 'react';

interface ImportEnvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  failed: Array<{ key: string; error: string }>;
}

export default function ImportEnvModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportEnvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseEnvFile = (content: string): Map<string, string> => {
    const envVars = new Map<string, string>();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (trimmed === '' || trimmed.startsWith('#')) {
        continue;
      }

      // Split on first = to handle values that contain =
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }

      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();

      // Remove surrounding quotes (both single and double) if present
      if (value.length >= 2) {
        if (
          (value[0] === '"' && value[value.length - 1] === '"') ||
          (value[0] === "'" && value[value.length - 1] === "'")
        ) {
          value = value.substring(1, value.length - 1);
        }
      }

      if (key) {
        envVars.set(key, value);
      }
    }

    return envVars;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      // Read file content
      const content = await file.text();
      
      // Parse .env file
      const envVars = parseEnvFile(content);

      if (envVars.size === 0) {
        setError('No valid variables found in the file');
        setImporting(false);
        return;
      }

      // Import each variable
      const importResult: ImportResult = {
        success: 0,
        failed: [],
      };

      for (const [key, value] of envVars.entries()) {
        try {
          const response = await fetch(`/api/variables/${encodeURIComponent(key)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            importResult.failed.push({
              key,
              error: errorData.message || `HTTP ${response.status}`,
            });
          } else {
            importResult.success++;
          }
        } catch (err) {
          importResult.failed.push({
            key,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      setResult(importResult);
      
      if (importResult.success > 0) {
        // Refresh variables list after a short delay
        setTimeout(() => {
          onImportComplete();
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>
            Import .env File
          </h2>
          <button
            onClick={handleClose}
            className="transition-colors"
            style={{ color: '#9A9A9A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#6B6B6B'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9A9A9A'}
            disabled={importing}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label
            htmlFor="envFile"
            className="block text-sm font-medium mb-2"
            style={{ color: '#2C2C2C' }}
          >
            Select .env File
          </label>
          <input
            ref={fileInputRef}
            id="envFile"
            type="file"
            accept=".env,.env.*,text/plain"
            onChange={handleFileChange}
            disabled={importing}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
            style={{
              borderColor: '#E8E6E1',
              backgroundColor: importing ? '#FAF8F3' : '#FFFFFF',
              color: '#2C2C2C',
            }}
          />
          {file && (
            <p className="mt-2 text-sm" style={{ color: '#6B6B6B' }}>
              Selected: {file.name}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: '#F5E8E8', borderColor: '#C85A5A' }}>
            <p className="text-sm" style={{ color: '#B54848' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: '#FAF8F3', borderColor: '#E8E6E1' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>
              Import Complete
            </p>
            <p className="text-sm mb-2" style={{ color: '#6B6B6B' }}>
              Successfully imported: <span className="font-semibold" style={{ color: '#6B9B7A' }}>{result.success}</span> variables
            </p>
            {result.failed.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1" style={{ color: '#C85A5A' }}>
                  Failed: {result.failed.length} variables
                </p>
                <div className="max-h-32 overflow-y-auto">
                  {result.failed.map((item, idx) => (
                    <p key={idx} className="text-xs" style={{ color: '#6B6B6B' }}>
                      <span className="font-mono">{item.key}</span>: {item.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ color: '#6B6B6B', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => !importing && (e.currentTarget.style.backgroundColor = '#FAF8F3')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: importing || !file ? '#9A9A9A' : '#5B8DB8' }}
              onMouseEnter={(e) => {
                if (!importing && file) {
                  e.currentTarget.style.backgroundColor = '#4A7BA5';
                }
              }}
              onMouseLeave={(e) => {
                if (!importing && file) {
                  e.currentTarget.style.backgroundColor = '#5B8DB8';
                }
              }}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

