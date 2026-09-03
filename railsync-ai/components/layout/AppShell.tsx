'use client';

// =============================================================================
// AppShell — Client-side layout wrapper
// =============================================================================
// Integrates:
// - StatusStrip & GlobalNav
// - Desktop/Laptop Sidebar & Mobile BottomNav
// - useNavMode dynamic margins & safe-area padding
// - useDevicePerformance benchmark runner
// - Session monitor & EC-07 expiry overlay
// =============================================================================

import { useEffect } from 'react';
import StatusStrip from '@/components/layout/StatusStrip';
import GlobalNav from '@/components/layout/GlobalNav';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import DebugPanel from '@/components/shared/DebugPanel';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useNavMode } from '@/hooks/useNavMode';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { useAuditStore } from '@/store/auditStore';
import { useSessionStore } from '@/store/sessionStore';
import { useThemeStore } from '@/store/themeStore';
import { AlertTriangle, Lock } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { minutesRemaining, showWarning, isExpired } = useSessionMonitor();
  const navMode = useNavMode();
  useDevicePerformance(); // 30ms canvas benchmark

  const initializeAudit = useAuditStore((s) => s.initializeFromSeed);
  const refreshSession = useSessionStore((s) => s.refreshSession);
  const theme = useThemeStore((s) => s.theme);

  // Initialize audit store with seed data (computes hash chain)
  useEffect(() => {
    initializeAudit();
  }, [initializeAudit]);

  // Synchronize data-theme attribute on <html> element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Dynamic layout offsets based on navigation mode
  const marginTop = navMode === 'mobile' ? '116px' : 'calc(var(--status-strip-height) + var(--nav-height))';
  const marginLeft =
    navMode === 'desktop'
      ? 'var(--sidebar-width)'
      : navMode === 'laptop'
        ? 'var(--sidebar-collapsed)'
        : '0px';

  const paddingBottom =
    navMode === 'mobile'
      ? 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + var(--spacing-4))'
      : 'var(--spacing-4)';

  return (
    <>
      <StatusStrip />
      <GlobalNav />
      <Sidebar />

      {/* Main content area — offset for fixed navigation elements */}
      <main
        style={{
          marginTop,
          marginLeft,
          minHeight: 'calc(100vh - 116px)',
          padding: 'var(--spacing-4)',
          paddingBottom,
          maxWidth: 'var(--content-max-width)',
          transition: 'margin-left 150ms ease-out, margin-top 150ms ease-out',
        }}
      >
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />

      {/* Session warning toast */}
      {showWarning && (
        <div
          style={{
            position: 'fixed',
            bottom: navMode === 'mobile' ? 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 12px)' : 'var(--spacing-4)',
            right: 'var(--spacing-4)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-accent-warning)',
            borderRadius: 'var(--radius-panel)',
            boxShadow: 'var(--shadow-default)',
            color: 'var(--color-accent-warning)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <AlertTriangle size={16} />
          <span>
            Session expiring in {minutesRemaining} min. Save pending work.
          </span>
          <button
            onClick={() => refreshSession()}
            className="btn btn--secondary"
            style={{
              padding: '2px 8px',
              fontSize: 'var(--text-xs)',
              marginLeft: 'var(--spacing-2)',
            }}
          >
            Extend Session
          </button>
        </div>
      )}

      {/* Session Expired Overlay (EC-07) */}
      {isExpired && (
        <div className="session-expired-overlay">
          <div className="session-expired-overlay__card">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-accent-critical)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              <Lock size={24} />
            </div>

            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Session Expired
            </h2>

            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--spacing-6)',
                lineHeight: 'var(--leading-base)',
              }}
            >
              Your 30-minute operational session has timed out in compliance with
              Indian Railways cybersecurity policy. Please re-authenticate.
            </p>

            <button
              onClick={() => refreshSession()}
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Re-authenticate Session
            </button>
          </div>
        </div>
      )}

      {/* Edge Case Debug Panel */}
      <DebugPanel />
    </>
  );
}
