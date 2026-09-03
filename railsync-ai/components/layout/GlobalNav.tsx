'use client';

// =============================================================================
// GlobalNav — Official RailSync-AI Navigation & Control Header
// =============================================================================
// Responsive modes:
// - Desktop: Logo, subtitle, Ctrl+K search, Day/Night toggle, refresh, full role dropdown
// - Laptop: Logo, icon search, Day/Night toggle, icon role badge with tooltip
// - Mobile: Logo, Day/Night toggle, hamburger menu button (overlay for settings/help)
// =============================================================================

import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useThemeStore } from '@/store/themeStore';
import { useNavMode } from '@/hooks/useNavMode';
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
  Menu,
  X,
  HelpCircle,
  LogOut,
  SlidersHorizontal,
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
  const navMode = useNavMode();

  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const currentRole = user?.role || 'ROLE_SC';
  const topOffset = navMode === 'mobile' ? '60px' : 'var(--status-strip-height)';

  return (
    <>
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
          top: topOffset,
          left: 0,
          right: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-default)',
        }}
      >
        {/* Left: Official Indian Railways Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-data)',
              background: 'var(--color-accent-operational)',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px 0 rgb(2 132 199 / 0.3)',
              flexShrink: 0,
            }}
          >
            <TrainTrack size={18} />
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
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-data)',
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: 'var(--color-accent-operational)',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-interface)',
                }}
              >
                v1.2
              </span>
            </div>
            {navMode !== 'mobile' && (
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
            )}
          </div>
        </div>

        {/* Center: Search input (Desktop only) */}
        {navMode === 'desktop' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-data)',
              padding: '6px 14px',
              width: 320,
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
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          {/* Day / Night Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn--secondary"
            style={{
              padding: '5px 8px',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minHeight: '36px',
            }}
            title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Ops'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} style={{ color: '#F59E0B' }} />
                {navMode === 'desktop' && <span>Day Mode</span>}
              </>
            ) : (
              <>
                <Moon size={14} style={{ color: 'var(--color-accent-operational)' }} />
                {navMode === 'desktop' && <span>Night Ops</span>}
              </>
            )}
          </button>

          {/* Desktop & Laptop Session Refresh */}
          {navMode !== 'mobile' && (
            <button
              onClick={refreshSession}
              className="btn btn--ghost"
              style={{ padding: 6, minHeight: '36px' }}
              title="Refresh active session (+30 min)"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {/* MODE 1 & 2: Desktop / Laptop Role Switcher */}
          {navMode !== 'mobile' ? (
            <div style={{ position: 'relative' }}>
              <button
                id="role-switcher-btn"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-data)',
                  border: '1px solid var(--color-border-strong)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  boxShadow: 'var(--shadow-default)',
                  minHeight: '36px',
                }}
                title={user?.name}
              >
                <Shield size={14} style={{ color: 'var(--color-accent-operational)' }} />
                {navMode === 'desktop' ? (
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
                      {ROLE_SHORT[currentRole as RoleCode] || currentRole}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {user?.name || 'R.K. Sharma'}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: '11px' }}>
                    {currentRole.replace('ROLE_', '')}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--color-text-secondary)',
                    transform: roleSwitcherOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 150ms ease-out',
                  }}
                />
              </button>

              {roleSwitcherOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 4px)',
                    width: 240,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-panel)',
                    padding: 'var(--spacing-2)',
                    zIndex: 60,
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  <div
                    style={{
                      padding: 'var(--spacing-2)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Switch Operational Role
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
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        borderRadius: 'var(--radius-data)',
                        background: role === currentRole ? 'var(--color-bg-hover)' : 'transparent',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{ROLE_SHORT[role]}</div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>
                          {ROLE_LABELS[role]}
                        </div>
                      </div>
                      {role === currentRole && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-operational)' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* MODE 3: Mobile Hamburger Menu Button */
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-data)',
                border: '1px solid var(--color-border-default)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
              aria-label="Open Overlay Menu"
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              height: 'var(--nav-height)',
              padding: '0 var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <TrainTrack size={18} style={{ color: 'var(--color-accent-operational)' }} />
              <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Control Terminal Settings</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 8 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <div
              style={{
                padding: 'var(--spacing-3)',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACTIVE USER SESSION</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginTop: 4 }}>{user?.name}</div>
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--color-accent-operational)' }}>
                {user?.role} • {user?.userId}
              </div>
            </div>

            <button
              onClick={() => {
                refreshSession();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                padding: '14px',
                borderRadius: 'var(--radius-panel)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={18} style={{ color: 'var(--color-accent-operational)' }} />
              <span>Refresh Operations Session (+30 min)</span>
            </button>

            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                padding: '14px',
                borderRadius: 'var(--radius-panel)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? <Sun size={18} style={{ color: '#F59E0B' }} /> : <Moon size={18} style={{ color: 'var(--color-accent-operational)' }} />}
              <span>Toggle Day / Night Ops Mode</span>
            </button>

            <div
              style={{
                marginTop: 'var(--spacing-4)',
                padding: 'var(--spacing-4)',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Indian Railways Technical Support
              </div>
              <div>CRIS Helpdesk: 011-2338-7654</div>
              <div>COA Operational Gateway: 10.42.1.200</div>
              <div>Gati-Shakti Unified Block Engine v1.2 PROD</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
