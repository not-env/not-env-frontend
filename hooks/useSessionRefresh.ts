'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to refresh session on user activity
 * Refreshes session expiration every time the user interacts with the app
 */
export function useSessionRefresh() {
  const refreshSession = useCallback(async () => {
    try {
      await fetch('/api/auth/session', { method: 'GET' });
    } catch (error) {
      // Silently fail - session might be expired, will be handled by page checks
      console.error('Failed to refresh session:', error);
    }
  }, []);

  useEffect(() => {
    // Refresh on mount
    refreshSession();

    // Refresh on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      refreshSession();
    };

    // Throttle to avoid too many requests (max once per 30 seconds)
    let lastRefresh = 0;
    const throttledRefresh = () => {
      const now = Date.now();
      if (now - lastRefresh > 30000) {
        lastRefresh = now;
        refreshSession();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledRefresh, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledRefresh);
      });
    };
  }, [refreshSession]);
}

