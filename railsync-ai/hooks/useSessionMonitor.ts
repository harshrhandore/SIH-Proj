// =============================================================================
// useSessionMonitor Hook
// =============================================================================
// Checks session expiry every 30 seconds.
// At 5 minutes remaining: toast warning.
// At expiry: locks the UI with overlay (EC-07).
// =============================================================================

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';

interface SessionMonitorState {
  minutesRemaining: number;
  showWarning: boolean;
  isExpired: boolean;
}

export function useSessionMonitor(): SessionMonitorState {
  const sessionExpiry = useSessionStore((state) => state.sessionExpiry);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isExpired = useSessionStore((state) => state.isExpired);
  const setExpired = useSessionStore((state) => state.setExpired);
  const getMinutesRemaining = useSessionStore((state) => state.getMinutesRemaining);
  const warningShownRef = useRef(false);

  const checkExpiry = useCallback(() => {
    if (!isAuthenticated || !sessionExpiry) return;

    const remaining = getMinutesRemaining();

    if (remaining <= 0) {
      setExpired();
    } else if (remaining <= 5 && !warningShownRef.current) {
      warningShownRef.current = true;
      // Toast-like warning — will be rendered by the component
    }
  }, [isAuthenticated, sessionExpiry, getMinutesRemaining, setExpired]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check immediately
    checkExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkExpiry, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkExpiry]);

  // Reset warning when session is refreshed
  useEffect(() => {
    if (!isExpired) {
      warningShownRef.current = false;
    }
  }, [isExpired]);

  const minutesRemaining = getMinutesRemaining();

  return {
    minutesRemaining,
    showWarning: minutesRemaining <= 5 && minutesRemaining > 0 && isAuthenticated,
    isExpired: isExpired && isAuthenticated,
  };
}
