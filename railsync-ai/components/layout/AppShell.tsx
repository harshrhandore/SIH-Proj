'use client';

// =============================================================================
// AppShell — Client-side layout wrapper
// =============================================================================
// Integrates StatusStrip, GlobalNav, Sidebar, session monitor, and
// session expiry overlay (EC-07). Used inside the server-side RootLayout.
// =============================================================================

import { useEffect } from 'react';
import StatusStrip from '@/components/layout/StatusStrip';
import GlobalNav from '@/components/layout/GlobalNav';
import Sidebar from '@/components/layout/Sidebar';
import DebugPanel from '@/components/shared/DebugPanel';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useAuditStore } from '@/store/auditStore';
import { useSessionStore } from '@/store/sessionStore';
import { useThemeStore } from '@/store/themeStore';
import { AlertTriangle, Lock } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { minutesRemaining, showWarning, isExpired } = useSessionMonitor();
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

  return (
    <>
      <StatusStrip />
      <GlobalNav />
      <Sidebar />

      {/* Main content area — offset for fixed nav elements */}
      <main
        style={{
          marginTop: 'calc(var(--status-strip-height) + var(--nav-height))',
          marginLeft: 'var(--sidebar-width)',
          minHeight: 'calc(100vh - var(--status-strip-height) - var(--nav-height))',
          padding: 'var(--spacing-4)',
          maxWidth: 'var(--content-max-width)',
          transition: 'margin-left 150ms ease-out',
        }}
      >
        {children}
      </main>

      {/* Session warning toast */}
      {showWarning && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--spacing-4)',
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
            fontFamily: 'var(--font-reading)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <AlertTriangle size={16} />
          <span>
            Session expiring in{' '}
            <span className="font-mono" style={{ fontWeight: 600 }}>
              {minutesRemaining} min
            </span>
            . Save work before logout.
          </span>
          <button
            onClick={refreshSession}
            className="btn btn--secondary"
            style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
          >
            Extend
          </button>
        </div>
      )}

      {/* Session expiry overlay (EC-07) */}
      {isExpired && (
        <div className="session-expired-overlay">
          <div className="session-expired-overlay__card">
            <Lock
              size={32}
              style={{
                color: 'var(--color-accent-critical)',
                marginBottom: 'var(--spacing-4)',
              }}
            />
            <h2
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: 'var(--text-xl)',
                fontWeight: 600,
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
                lineHeight: 'var(--leading-sm)',
                marginBottom: 'var(--spacing-6)',
              }}
            >
              All unsaved block memo data has been preserved locally (mock draft
              cache). Re-authenticate to continue.
            </p>
            <button
              onClick={refreshSession}
              className="btn btn--primary"
              style={{ width: '100%' }}
            >
              Re-authenticate
            </button>
          </div>
        </div>
      )}

      {/* Floating Edge Case Debug Console */}
      <DebugPanel />
    </>
  );
}
