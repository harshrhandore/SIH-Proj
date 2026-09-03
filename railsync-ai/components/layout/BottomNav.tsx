'use client';

// =============================================================================
// BottomNav — Fixed 56px Bottom Navigation Bar for Mobile & Tablet Portrait
// =============================================================================
// Tabs: Dashboard | Workspace | Simulate | Audit | [Role]
// Active tab: Accent blue underline & active tint.
// Role tab: Opens a bottom sheet role-switcher without page navigation.
// Includes iPhone safe-area padding: env(safe-area-inset-bottom).
// =============================================================================

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import type { RoleCode } from '@/types/railway';
import {
  LayoutDashboard,
  GitBranchPlus,
  Zap,
  ShieldCheck,
  User,
  X,
  Check,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Workspace', href: '/workspace', icon: <GitBranchPlus size={20} /> },
  { label: 'Simulate', href: '/simulate', icon: <Zap size={20} /> },
  { label: 'Audit', href: '/audit', icon: <ShieldCheck size={20} /> },
];

const ROLES: { role: RoleCode; label: string; sub: string }[] = [
  { role: 'ROLE_SC', label: 'Section Controller (SC)', sub: 'R.K. Sharma • Full Grant Authority' },
  { role: 'ROLE_ENG', label: 'Engineering Applicant', sub: 'A.K. Verma • Submit Protests' },
  { role: 'ROLE_ST', label: 'S&T Applicant', sub: 'P.K. Singh • Cable & Interlocking' },
  { role: 'ROLE_TPC', label: 'Traction Power (OHE)', sub: 'R.N. Roy • OHE Power Isolation' },
];

export default function BottomNav() {
  const navMode = useNavMode();
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const switchRole = useSessionStore((s) => s.switchRole);

  const [roleSheetOpen, setRoleSheetOpen] = useState(false);

  // BottomNav is only shown in mobile mode (< 1024px)
  if (navMode !== 'mobile') return null;

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          zIndex: 45,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                color: isActive
                  ? 'var(--color-accent-operational)'
                  : 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
                minHeight: '44px',
                transition: 'color 120ms ease-out',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--color-accent-operational)',
                    borderRadius: '2px',
                  }}
                />
              )}
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* Role Switcher Tab */}
        <button
          onClick={() => setRoleSheetOpen(true)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            minHeight: '44px',
          }}
          aria-label="Switch User Role"
        >
          <User size={20} />
          <span className="font-mono" style={{ fontSize: '10px' }}>
            {user?.role.replace('ROLE_', '') || 'ROLE'}
          </span>
        </button>
      </nav>

      {/* Role Switcher Bottom Sheet */}
      {roleSheetOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setRoleSheetOpen(false)}
        >
          <div
            className="bottom-sheet-slide-up"
            style={{
              background: 'var(--color-bg-elevated)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              borderTop: '1px solid var(--color-border-strong)',
              padding: 'var(--spacing-4)',
              paddingBottom: 'calc(var(--spacing-6) + env(safe-area-inset-bottom, 0px))',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bottom-sheet-drag-handle" />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-3)',
                paddingBottom: 'var(--spacing-2)',
                borderBottom: '1px solid var(--color-border-default)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Select Active Operational Role
              </h3>
              <button
                onClick={() => setRoleSheetOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {ROLES.map((r) => {
                const isCurrent = user?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setRoleSheetOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-panel)',
                      border: isCurrent
                        ? '1.5px solid var(--color-accent-operational)'
                        : '1px solid var(--color-border-default)',
                      background: isCurrent ? 'var(--color-bg-hover)' : 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minHeight: '52px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {r.sub}
                      </div>
                    </div>
                    {isCurrent && <Check size={18} style={{ color: 'var(--color-accent-operational)' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
