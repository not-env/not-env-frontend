'use client';

interface DeleteVariableModalProps {
  isOpen: boolean;
  variableKey: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteVariableModal({
  isOpen,
  variableKey,
  onClose,
  onConfirm,
}: DeleteVariableModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2C2C2C' }}>
            Delete Variable
          </h2>
        </div>

        <div className="mb-6">
          <p style={{ color: '#2C2C2C' }}>
            Are you sure you want to delete the variable{' '}
            <span className="font-mono font-semibold" style={{ color: '#5B8DB8' }}>
              {variableKey}
            </span>?
          </p>
          <p className="mt-2 text-sm" style={{ color: '#6B6B6B' }}>
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#6B6B6B', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#C85A5A' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B54848'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C85A5A'}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

