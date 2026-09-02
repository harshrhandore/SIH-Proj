'use client';

// =============================================================================
// GlobalNav — Official RailSync-AI Navigation & Control Header
// =============================================================================
// Human-crafted enterprise navigation:
// - Authentic Ministry of Railways / Gati-Shakti branding
// - Instant Day Mode / Night Ops toggle
// - Global Quick Search hint (Ctrl+K)
// - Role switcher with clear department insignia
// =============================================================================

import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useThemeStore } from '@/store/themeStore';
import { ROLE_LABELS, type RoleCode } from '@/types/railway';
import {
  Shield,
  ChevronDown,
  User,
  RefreshCw,
  Sun,
  Moon,
  Search,
  TrainTrack,
} from 'lucide-react';

const ROLES: RoleCode[] = ['ROLE_SC', 'ROLE_ENG', 'ROLE_TPC', 'ROLE_ST'];

const ROLE_SHORT: Record<RoleCode, string> = {
  ROLE_SC: 'OPERATING (SC)',
  ROLE_ENG: 'CIVIL / P-WAY',
  ROLE_TPC: 'ELECTRICAL (OHE)',
  ROLE_ST: 'SIGNAL & TELECOM',
};

export default function GlobalNav() {
  const user = useSessionStore((s) => s.user);
  const switchRole = useSessionStore((s) => s.switchRole);
  const refreshSession = useSessionStore((s) => s.refreshSession);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const currentRole = user?.role || 'ROLE_SC';

  return (
    <nav
      style={{
        height: 'var(--nav-height)',
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-4)',
        position: 'fixed',
        top: 'var(--status-strip-height)',
        left: 0,
        right: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-default)',
      }}
    >
      {/* Left: Official Indian Railways Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        {/* Railway Insignia Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-data)',
            background: 'var(--color-accent-operational)',
            color: '#FFFFFF',
            boxShadow: '0 2px 4px 0 rgb(2 132 199 / 0.3)',
          }}
        >
          <TrainTrack size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              RailSync-AI
            </span>
            <span
              style={{
                padding: '1px 6px',
                borderRadius: 'var(--radius-data)',
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--color-accent-operational)',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'var(--font-interface)',
              }}
            >
              v1.2 PROD
            </span>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.02em',
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            गति शक्ति • Gati-Shakti Unified Block Engine
          </div>
        </div>
      </div>

      {/* Center: Quick Search Bar (Real Enterprise UX) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-data)',
          padding: '6px 14px',
          width: 340,
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
        <span style={{ flex: 1 }}>Search train #, station, block memo...</span>
        <kbd
          className="font-mono"
          style={{
            background: 'var(--color-bg-hover)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 3,
            padding: '1px 5px',
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
          }}
        >
          Ctrl K
        </kbd>
      </div>

      {/* Right: Controls & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        {/* Day Mode / Night Ops Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn--secondary"
          style={{
            padding: '5px 10px',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title={theme === 'light' ? 'Switch to Night Ops Mode' : 'Switch to Day Mode'}
        >
          {theme === 'light' ? (
            <>
              <Moon size={14} style={{ color: 'var(--color-accent-operational)' }} />
              <span>Night Ops</span>
            </>
          ) : (
            <>
              <Sun size={14} style={{ color: 'var(--color-accent-warning)' }} />
              <span>Day Mode</span>
            </>
          )}
        </button>

        {/* Refresh Session */}
        <button
          onClick={refreshSession}
          className="btn btn--ghost"
          style={{ padding: '6px' }}
          title="Refresh active session (+30 min)"
        >
          <RefreshCw size={14} />
        </button>

        {/* Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            id="role-switcher-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-data)',
              border: '1px solid var(--color-border-strong)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-reading)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              boxShadow: 'var(--shadow-default)',
            }}
          >
            <Shield size={14} style={{ color: 'var(--color-accent-operational)' }} />
            <div>
              <span
                className="font-mono"
                style={{
                  fontWeight: 700,
                  color: 'var(--color-accent-operational)',
                  display: 'block',
                  fontSize: '10px',
                }}
              >
                {ROLE_SHORT[currentRole]}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {user?.name || 'R.K. Sharma'}
              </span>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--color-text-secondary)',
                transform: roleSwitcherOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 150ms ease-out',
                marginLeft: 4,
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {roleSwitcherOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 'var(--spacing-1)',
                width: 340,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-panel)',
                boxShadow: 'var(--shadow-elevated)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border-default)',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  background: 'var(--color-bg-primary)',
                }}
              >
                Divisional Operating Roles (RBAC)
              </div>

              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setRoleSwitcherOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    width: '100%',
                    padding: 'var(--spacing-3)',
                    border: 'none',
                    background: role === currentRole ? 'var(--color-bg-hover)' : 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-reading)',
                    fontSize: 'var(--text-xs)',
                    textAlign: 'left',
                    borderBottom: '1px solid var(--color-border-default)',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        role === currentRole
                          ? 'var(--color-accent-operational)'
                          : 'var(--color-border-strong)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: role === currentRole ? 700 : 500 }}>
                      {ROLE_LABELS[role]}
                    </div>
                    <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                      {role}
                    </div>
                  </div>
                  {role === currentRole && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-accent-operational)',
                        fontWeight: 700,
                        padding: '1px 6px',
                        background: 'rgba(2, 132, 199, 0.1)',
                        borderRadius: 'var(--radius-data)',
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Icon Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-bg-hover)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <User size={16} />
        </div>
      </div>
    </nav>
  );
}
