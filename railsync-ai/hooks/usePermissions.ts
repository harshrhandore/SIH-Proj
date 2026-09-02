// =============================================================================
// usePermissions Hook
// =============================================================================
// Render-level RBAC enforcement. Must be called at the component render level,
// NEVER inside an event handler only. Returns boolean indicating permission.
// =============================================================================

import { useSessionStore } from '@/store/sessionStore';
import { PermissionAction, PERMISSION_MATRIX, PERMISSION_DESCRIPTIONS } from '@/types/permissions';

/**
 * Check if the current user role has permission for a given action.
 * Called at render level to gate UI elements.
 *
 * @returns Object with permission state and description for aria-labels
 */
export function usePermissions(action: PermissionAction): {
  allowed: boolean;
  description: string;
  roleName: string;
} {
  const user = useSessionStore((state) => state.user);
  const role = user?.role;

  if (!role) {
    return {
      allowed: false,
      description: 'Not authenticated',
      roleName: 'Unknown',
    };
  }

  const rolePermissions = PERMISSION_MATRIX[role];
  const allowed = rolePermissions[action] === true;
  const description = PERMISSION_DESCRIPTIONS[action];

  return {
    allowed,
    description,
    roleName: role,
  };
}

/**
 * Check multiple permissions at once.
 */
export function useMultiplePermissions(
  actions: PermissionAction[]
): Record<PermissionAction, boolean> {
  const user = useSessionStore((state) => state.user);
  const role = user?.role;

  const result = {} as Record<PermissionAction, boolean>;
  for (const action of actions) {
    if (!role) {
      result[action] = false;
    } else {
      result[action] = PERMISSION_MATRIX[role][action] === true;
    }
  }
  return result;
}
