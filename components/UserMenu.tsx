'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SwitchAccountModal from './SwitchAccountModal';

interface UserMenuProps {
  keyType?: 'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY';
}

export default function UserMenu({ keyType: propKeyType }: UserMenuProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);
  const [keyType, setKeyType] = useState<'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY' | null>(propKeyType || null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch session to get current keyType
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await fetch(`/api/auth/session?t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setKeyType(data.keyType);
        } else {
          // Session invalid, clear keyType
          setKeyType(null);
        }
      } catch (err) {
        setKeyType(null);
      }
    };

    // If prop is provided, use it immediately, but still verify with session
    if (propKeyType) {
      setKeyType(propKeyType);
    }
    
    // Always fetch from session to ensure we have the latest value
    fetchSession();
    
    // Also fetch again after a short delay to catch session updates after page reload
    const timeout = setTimeout(() => {
      fetchSession();
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [propKeyType]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getInitials = () => {
    // Generate initials based on key type
    if (!keyType) return '?';
    if (keyType === 'APP_ADMIN') return 'AA';
    if (keyType === 'ENV_ADMIN') return 'EA';
    return 'RO';
  };

  const getKeyTypeLabel = () => {
    if (!keyType) return 'Unknown';
    if (keyType === 'APP_ADMIN') return 'App Admin';
    if (keyType === 'ENV_ADMIN') return 'Environment Admin';
    return 'Read Only';
  };

  if (!keyType) {
    // Show loading state
    return (
      <div className="flex items-center space-x-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundColor: '#E8E6E1',
            color: '#9A9A9A',
          }}
        >
          ...
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleSwitchAccount = () => {
    setShowMenu(false);
    setShowSwitchAccount(true);
  };

  const handleProfile = () => {
    setShowMenu(false);
    router.push('/profile');
  };

  return (
    <>
      <div className="relative flex items-center" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all hover:shadow-md"
              style={{
                backgroundColor: '#5B8DB8',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4A7BA5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#5B8DB8';
              }}
            >
              {getInitials()}
            </div>
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50 border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E8E6E1',
              }}
            >
              <div className="py-2">
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E8E6E1' }}>
                  <p className="text-sm font-semibold" style={{ color: '#2C2C2C' }}>
                    {getKeyTypeLabel()}
                  </p>
                  <p className="text-xs mt-1 font-mono" style={{ color: '#9A9A9A' }}>
                    {keyType}
                  </p>
                </div>

                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: '#2C2C2C' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAF8F3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>Profile</span>
                  </div>
                </button>

                <button
                  onClick={handleSwitchAccount}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: '#2C2C2C' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAF8F3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>🔄</span>
                    <span>Switch Account</span>
                  </div>
                </button>

                <div className="border-t my-1" style={{ borderColor: '#E8E6E1' }} />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: '#C85A5A' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5E8E8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>🚪</span>
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSwitchAccount && (
        <SwitchAccountModal
          onClose={() => setShowSwitchAccount(false)}
          onSuccess={() => {
            setShowSwitchAccount(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

