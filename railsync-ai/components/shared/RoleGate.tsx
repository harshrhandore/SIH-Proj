'use client';

// =============================================================================
// RoleGate — Permission wrapper component
// =============================================================================
// Uses usePermissions hook at render level.
// Renders children if allowed, otherwise shows "Access restricted" state.
// =============================================================================

import { usePermissions } from '@/hooks/usePermissions';
import { PermissionAction } from '@/types/permissions';
import { ROLE_LABELS } from '@/types/railway';
import { useSessionStore } from '@/store/sessionStore';
import { Lock } from 'lucide-react';

interface RoleGateProps {
  action: PermissionAction;
  children: React.ReactNode;
  /** If true, renders nothing instead of the restricted message */
  hideIfRestricted?: boolean;
  /** If true, renders children but disabled (greyed out) */
  disableIfRestricted?: boolean;
  /** Custom fallback component */
  fallback?: React.ReactNode;
}

export default function RoleGate({
  action,
  children,
  hideIfRestricted = false,
  disableIfRestricted = false,
  fallback,
}: RoleGateProps) {
  const { allowed, description } = usePermissions(action);
  const user = useSessionStore((s) => s.user);
  const roleName = user?.role ? ROLE_LABELS[user.role] : 'Unknown';

  if (allowed) {
    return <>{children}</>;
  }

  if (hideIfRestricted) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (disableIfRestricted) {
    return (
      <div
        style={{ opacity: 0.4, pointerEvents: 'none', cursor: 'not-allowed' }}
        aria-label={description}
        title={description}
      >
        {children}
      </div>
    );
  }

  // Default: show access restricted message
  return (
    <div className="access-restricted" aria-label={description}>
      <Lock size={14} style={{ marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
      <span>
        Access restricted — Role: {roleName}
      </span>
    </div>
  );
}
