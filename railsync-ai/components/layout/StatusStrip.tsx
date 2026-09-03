'use client';

// =============================================================================
// StatusStrip — Official Indian Railways Operations Status Header
// =============================================================================
// Adaptive responsive layout:
// - DESKTOP (>=1440px): 1-row, 44px, full division specs + clock + shift + role
// - LAPTOP (1024px-1439px): 1-row, 44px condensed
// - TABLET PORTRAIT / PHONE (<1024px): 2-row, 64px total, tap opens details bottom sheet
// =============================================================================

import { useEffect, useState } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import { Radio, X, Info } from 'lucide-react';

export default function StatusStrip() {
  const divisionStatus = useOperationalStore((s) => s.divisionStatus);
  const user = useSessionStore((s) => s.user);
  const navMode = useNavMode();

  const [clock, setClock] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const opsStateTagClass =
    divisionStatus.opsState === 'NORMAL'
      ? 'status-tag--normal'
      : divisionStatus.opsState === 'CAUTION'
        ? 'status-tag--warning'
        : 'status-tag--critical';

  const roleAbbr = user?.role.replace('ROLE_', '') || 'SC';

  return (
    <>
      <div
        id="status-strip-header"
        onClick={() => {
          if (navMode === 'mobile') setDetailsOpen(true);
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--color-bg-elevated)',
          borderBottom: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-default)',
          cursor: navMode === 'mobile' ? 'pointer' : 'default',
        }}
      >
        {/* National Tricolor Accent Strip */}
        <div className="gov-tricolor-strip" />

        {/* MODE 1 & 2: Desktop & Laptop (Single Row, 44px) */}
        {navMode !== 'mobile' ? (
          <div
            style={{
              height: 'calc(var(--status-strip-height) - 3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 var(--spacing-4)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {/* Left: Corridor Specs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  उत्तर रेलवे • NORTHERN RAILWAY
                </span>
                <span style={{ color: 'var(--color-border-strong)' }}>/</span>
                <span style={{ color: 'var(--color-text-secondary)' }} title="GZB–CNB Double Line Electrified">
                  GZB–CNB Corridor {navMode === 'desktop' && `(${divisionStatus.corridorLength} km)`}
                </span>
              </div>

              {navMode === 'desktop' && (
                <>
                  <span style={{ color: 'var(--color-border-strong)' }}>|</span>
                  <span>Double Line Electrified</span>
                </>
              )}

              <span style={{ color: 'var(--color-border-strong)' }}>|</span>

              {/* Operational State Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>OPS:</span>
                <span className={`status-tag ${opsStateTagClass}`}>
                  {divisionStatus.opsState}
                </span>
              </div>

              <span style={{ color: 'var(--color-border-strong)' }}>|</span>

              {/* COA Live Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--color-accent-success)',
                }}
              >
                <Radio size={12} />
                <span style={{ fontWeight: 500 }}>COA-IR Live (14ms)</span>
              </div>
            </div>

            {/* Right: Shift & Clock & Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              {navMode === 'desktop' && (
                <>
                  <span>
                    Shift 1: <strong style={{ color: 'var(--color-text-primary)' }}>06:00 – 14:00 IST</strong>
                  </span>
                  <span style={{ color: 'var(--color-border-strong)' }}>|</span>
                </>
              )}

              <span
                className="font-mono"
                style={{
                  color: 'var(--color-text-mono)',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '2px 8px',
                  background: 'var(--color-bg-hover)',
                  borderRadius: 'var(--radius-data)',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                {clock || '10:45:00'} IST
              </span>

              <span style={{ color: 'var(--color-border-strong)' }}>|</span>

              <span>
                Duty: <strong style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'R.K. Sharma'}</strong>
              </span>
            </div>
          </div>
        ) : (
          /* MODE 3: Tablet Portrait & Phone (Two Rows, 60px total) */
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: '11px',
            }}
          >
            {/* Row 1: Section name (truncated) + Ops state tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                  NR / GZB–CNB
                </span>
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '140px',
                  }}
                >
                  Main Line 412km
                </span>
                <Info size={12} style={{ color: 'var(--color-accent-operational)', flexShrink: 0 }} />
              </div>

              <span className={`status-tag ${opsStateTagClass}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                ● {divisionStatus.opsState}
              </span>
            </div>

            {/* Row 2: Clock + Role Abbr + COA indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--color-text-mono)' }}>
                {clock || '10:45:00'} IST
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-accent-success)', fontSize: '10px' }}>
                  <Radio size={10} />
                  <span>COA Live</span>
                </div>
                <span style={{ color: 'var(--color-border-strong)' }}>•</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  [{roleAbbr}] {user?.name.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Section Details Bottom Sheet on Mobile Tap */}
      {detailsOpen && (
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
          onClick={() => setDetailsOpen(false)}
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bottom-sheet-drag-handle" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Corridor & Telemetry Telemetry
              </h3>
              <button
                onClick={() => setDetailsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Division:</span>
                <strong>उत्तर रेलवे • NORTHERN RAILWAY (GZB Division)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Corridor:</span>
                <span>Ghaziabad – Kanpur Central (412 km)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Traction & Signaling:</span>
                <span>Double Line Electrified (25kV AC) • Automatic Block</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Duty Shift:</span>
                <span>Shift 1 (06:00 – 14:00 IST) • Post #4</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Gateway Link:</span>
                <span style={{ color: 'var(--color-accent-success)', fontWeight: 600 }}>COA-IR Gateway 10.42.1.200 (14ms)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
