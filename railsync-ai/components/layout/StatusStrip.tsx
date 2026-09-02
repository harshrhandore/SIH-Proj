'use client';

// =============================================================================
// StatusStrip — Official Indian Railways Operations Status Header
// =============================================================================
// Designed with authentic GovTech operational styling:
// - Subtle Indian Tricolor accent line at the very top
// - Bilingual Division ID: "उत्तर रेलवे | Northern Railway — Ghaziabad Division"
// - Real-world Duty Shift metadata
// - Crisp, executive live status indicator
// =============================================================================

import { useEffect, useState } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { ROLE_LABELS } from '@/types/railway';
import { Activity, Radio } from 'lucide-react';

export default function StatusStrip() {
  const divisionStatus = useOperationalStore((s) => s.divisionStatus);
  const user = useSessionStore((s) => s.user);
  const [clock, setClock] = useState('');

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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-default)',
      }}
    >
      {/* Subtle National Tricolor Accent Strip */}
      <div className="gov-tricolor-strip" />

      {/* Operational Header Content */}
      <div
        style={{
          height: 'calc(var(--status-strip-height) - 3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-4)',
          fontFamily: 'var(--font-reading)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {/* Left: Official Railway Division Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              उत्तर रेलवे • NORTHERN RAILWAY
            </span>
            <span style={{ color: 'var(--color-border-strong)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              GZB–CNB Main Line Corridor ({divisionStatus.corridorLength} km)
            </span>
          </div>

          <span style={{ color: 'var(--color-border-strong)' }}>|</span>

          <span style={{ color: 'var(--color-text-secondary)' }}>
            Double Line Electrified
          </span>

          <span style={{ color: 'var(--color-border-strong)' }}>|</span>

          {/* Operational State Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              OPS STATE:
            </span>
            <span className={`status-tag ${opsStateTagClass}`}>
              {divisionStatus.opsState}
            </span>
          </div>

          <span style={{ color: 'var(--color-border-strong)' }}>|</span>

          {/* COA Link Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-accent-success)' }}>
            <Radio size={12} />
            <span style={{ fontWeight: 500 }}>COA-IR Live (14ms)</span>
          </div>
        </div>

        {/* Right: Duty Shift + Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Shift 1: <strong style={{ color: 'var(--color-text-primary)' }}>06:00 – 14:00 IST</strong>
          </span>

          <span style={{ color: 'var(--color-border-strong)' }}>|</span>

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
            {clock} IST
          </span>

          {user && (
            <>
              <span style={{ color: 'var(--color-border-strong)' }}>|</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Duty Officer:{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{user.name}</strong>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
