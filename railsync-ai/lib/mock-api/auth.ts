// =============================================================================
// Mock Auth API
// =============================================================================
// JWT-like mock token generation and CSRF validation.
// Tokens are never persisted to localStorage — stored in Zustand only.
// =============================================================================

import type { RoleCode, UserProfile } from '@/types/railway';
import { withLatency } from '@/lib/utils/simulateLatency';
import { USERS } from '@/data/seed';

interface MockJWTPayload {
  userId: string;
  role: RoleCode;
  divisionCode: string;
  sessionExpiry: string;
  csrfToken: string;
}

interface AuthResponse {
  success: boolean;
  token: MockJWTPayload | null;
  error?: string;
}

/**
 * Mock login — generates a JWT-like token payload.
 */
export async function mockLogin(
  employeeId: string,
  pin: string,
  role: RoleCode
): Promise<AuthResponse> {
  // Find user by role (in real system, would validate credentials)
  const user = Object.values(USERS).find((u) => u.role === role);

  if (!user) {
    return withLatency(
      { success: false, token: null, error: 'Invalid credentials' },
      80,
      400
    );
  }

  // Mock PIN validation (any 6-digit PIN is accepted in demo)
  if (!/^\d{6}$/.test(pin)) {
    return withLatency(
      { success: false, token: null, error: 'PIN must be 6 digits' },
      80,
      400
    );
  }

  const token: MockJWTPayload = {
    userId: user.userId,
    role: user.role,
    divisionCode: user.divisionCode,
    sessionExpiry: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    csrfToken: `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  };

  return withLatency({ success: true, token }, 80, 400);
}

/**
 * Validate CSRF token matches session.
 * Every state-modifying mock API call must include this check.
 */
export function validateCsrf(
  requestCsrf: string,
  sessionCsrf: string
): { valid: boolean; error?: string } {
  if (!requestCsrf || requestCsrf !== sessionCsrf) {
    return {
      valid: false,
      error: 'CSRF_VALIDATION_FAILED',
    };
  }
  return { valid: true };
}

/**
 * Check if session has expired.
 */
export function isSessionExpired(sessionExpiry: string): boolean {
  return new Date(sessionExpiry).getTime() <= Date.now();
}

/**
 * Get user profile by role code.
 */
export function getUserByRole(role: RoleCode): UserProfile | undefined {
  return Object.values(USERS).find((u) => u.role === role);
}
