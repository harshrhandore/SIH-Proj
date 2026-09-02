// =============================================================================
// Session Store (Zustand)
// =============================================================================
// Manages: user identity, active role, CSRF token, session expiry.
// JWT-like mock tokens stored in-memory only (NOT localStorage).
// Role switching immediately updates what's visible across the app.
// =============================================================================

import { create } from 'zustand';
import type { RoleCode, UserProfile, SessionState } from '@/types/railway';
import { USERS } from '@/data/seed';

function generateCsrfToken(): string {
  return `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateSessionId(): string {
  return `SES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8)}`;
}

function getExpiryTime(minutesFromNow: number = 30): string {
  const expiry = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return expiry.toISOString();
}

interface SessionStore extends SessionState {
  // Actions
  login: (role: RoleCode) => void;
  switchRole: (role: RoleCode) => void;
  logout: () => void;
  refreshSession: () => void;
  setExpired: () => void;
  getMinutesRemaining: () => number;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  // Initial state — logged in as Section Controller
  user: USERS['USR-SC-001'],
  csrfToken: generateCsrfToken(),
  sessionId: generateSessionId(),
  sessionExpiry: getExpiryTime(30),
  isAuthenticated: true,
  isExpired: false,

  login: (role: RoleCode) => {
    const userKey = Object.keys(USERS).find(
      (k) => USERS[k].role === role
    );
    const user = userKey ? USERS[userKey] : null;

    if (user) {
      set({
        user,
        csrfToken: generateCsrfToken(),
        sessionId: generateSessionId(),
        sessionExpiry: getExpiryTime(30),
        isAuthenticated: true,
        isExpired: false,
      });
    }
  },

  switchRole: (role: RoleCode) => {
    const userKey = Object.keys(USERS).find(
      (k) => USERS[k].role === role
    );
    const user = userKey ? USERS[userKey] : null;

    if (user) {
      set({
        user,
        // Keep existing session but refresh CSRF
        csrfToken: generateCsrfToken(),
      });
    }
  },

  logout: () => {
    set({
      user: null,
      csrfToken: '',
      sessionId: '',
      sessionExpiry: '',
      isAuthenticated: false,
      isExpired: false,
    });
  },

  refreshSession: () => {
    set({
      sessionExpiry: getExpiryTime(30),
      csrfToken: generateCsrfToken(),
      isExpired: false,
    });
  },

  setExpired: () => {
    set({ isExpired: true });
  },

  getMinutesRemaining: () => {
    const state = get();
    if (!state.sessionExpiry) return 0;
    const diff = new Date(state.sessionExpiry).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 60000));
  },
}));
