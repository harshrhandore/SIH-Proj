'use client';

// =============================================================================
// OperationalAnchors — 3 anchors + Corridor Health panel
// =============================================================================
// Responsive adaptations:
// - PHONE (<768px): 3 single-line summary cards (56px tall each)
// - TABLET PORTRAIT (768–1023px): Stacked 1-column layout, text-only health summary
// - LAPTOP (1024–1279px): 2-column layout with 16px padding
// - DESKTOP (>=1440px): 2/3 and 1/3 grid with full charts
// =============================================================================

import { useMemo } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import { ROLE_DEPARTMENT_MAP } from '@/types/permissions';
import { DEPARTMENT_LABELS } from '@/types/railway';
import { Clock, AlertTriangle, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function OperationalAnchors() {
  const proposals = useOperationalStore((s) => s.proposals);
  const divisionStatus = useOperationalStore((s) => s.divisionStatus);
  const user = useSessionStore((s) => s.user);
  const tsrs = useOperationalStore((s) => s.tsrs);
  const navMode = useNavMode();

  const role = user?.role || 'ROLE_SC';
  const deptFilter = ROLE_DEPARTMENT_MAP[role];

  const nextBlock = useMemo(() => {
    const now = new Date();
    return (
      proposals
        .filter(
          (p) =>
            (p.status === 'APPROVED' || p.status === 'ACTIVE') &&
            p.actualGrantedStart &&
            new Date(p.actualGrantedStart) >= now
        )
        .sort(
          (a, b) =>
            new Date(a.actualGrantedStart!).getTime() -
            new Date(b.actualGrantedStart!).getTime()
        )[0] || null
    );
  }, [proposals]);

  // Pending proposals filtered by role
  const pendingProposals = proposals.filter(
    (p) =>
      (p.status === 'PENDING' || p.status === 'AI_RECOMMENDED' || p.status === 'UNDER_REVIEW') &&
      (!deptFilter || p.department === deptFilter)
  );

  // Calculate urgency for highest priority pending proposal
  const highestUrgency =
    pendingProposals.length > 0
      ? (() => {
          const now = Date.now();
          const earliest = pendingProposals.reduce((min, p) => {
            const start = new Date(p.requestedStart).getTime();
            const diff = start - now;
            return diff < min ? diff : min;
          }, Infinity);
          const hours = Math.floor(earliest / 3600000);
          const mins = Math.floor((earliest % 3600000) / 60000);
          return `${hours}h ${mins}m left`;
        })()
      : 'None';

  // PHONE MODE: 3 Single-line compressed summary cards (56px tall each)
  if (navMode === 'mobile') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Anchor 1 Single-line */}
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <div
            className="panel"
            style={{
              padding: '12px 14px',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
              <span
                className="font-mono"
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--color-accent-warning)',
                  padding: '2px 6px',
                  background: 'rgba(180, 83, 9, 0.12)',
                  borderRadius: 'var(--radius-data)',
                }}
              >
                {pendingProposals.length}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Pending Proposals
              </span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                • Urgency: <span className="font-mono">{highestUrgency}</span>
              </span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--color-accent-operational)' }} />
          </div>
        </Link>

        {/* Anchor 2 Single-line */}
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <div
            className="panel"
            style={{
              padding: '12px 14px',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
              <Clock size={14} style={{ color: 'var(--color-accent-success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Next Block:
              </span>
              <span className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                {nextBlock
                  ? `${new Date(nextBlock.actualGrantedStart!).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • km ${nextBlock.section.fromKm}–${nextBlock.section.toKm}`
                  : '14:30–16:00 | km 287–309'}
              </span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--color-accent-operational)' }} />
          </div>
        </Link>

        {/* Anchor 3 Single-line */}
        <Link href="/audit" style={{ textDecoration: 'none' }}>
          <div
            className="panel"
            style={{
              padding: '12px 14px',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
              <Activity size={14} style={{ color: 'var(--color-accent-success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Health Index:
              </span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--color-accent-success)' }}>
                {divisionStatus.healthIndex}/100
              </span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                • TSRs: <strong className="font-mono">{tsrs.length}</strong>
              </span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--color-accent-operational)' }} />
          </div>
        </Link>
      </div>
    );
  }

  // TABLET PORTRAIT: Stacked 1-Column Layout
  const isTabletPortrait = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isTabletPortrait ? '1fr' : '1fr 280px',
        gap: 'var(--spacing-4)',
      }}
    >
      {/* Left: Anchors 1 & 2 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {/* Anchor 1: Pending Joint Block Proposals */}
        <div className="panel" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-accent-warning)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Pending Joint Block Proposals
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)' }}>
              <span className="font-mono" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-accent-warning)' }}>
                {pendingProposals.length}
              </span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Pending
              </span>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>|</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Highest urgency: <span className="font-mono" style={{ color: 'var(--color-accent-warning)' }}>{highestUrgency}</span>
            </span>
          </div>

          <Link
            href="/workspace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
              marginTop: 'var(--spacing-3)',
              color: 'var(--color-accent-operational)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View Queue <ArrowRight size={14} />
          </Link>
        </div>

        {/* Anchor 2: Next Approved Block Window */}
        <div className="panel" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
            <Clock size={16} style={{ color: 'var(--color-accent-operational)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Next Approved Block Window
            </h3>
          </div>

          {nextBlock ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                <span className="font-mono" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-accent-success)' }}>
                  {new Date(nextBlock.actualGrantedStart!).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </span>
                <span style={{ color: 'var(--color-border-strong)' }}>|</span>
                <span className="font-mono" style={{ color: 'var(--color-text-mono)', fontSize: 'var(--text-sm)' }}>
                  km {nextBlock.section.fromKm}–{nextBlock.section.toKm}
                </span>
              </div>
              <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                <span className={`dept-tag dept-tag--${nextBlock.department.toLowerCase()}`}>
                  {nextBlock.department}
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {nextBlock.equipmentActivity.slice(0, 45)}...
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              No upcoming approved blocks scheduled for today.
            </div>
          )}

          <Link
            href="/workspace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
              marginTop: 'var(--spacing-3)',
              color: 'var(--color-accent-operational)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Review Block Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Anchor 3: Corridor Health Panel */}
      <div className="panel" style={{ padding: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
          <Activity size={16} style={{ color: 'var(--color-accent-success)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Corridor Health Index
          </h3>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent-success)' }}>
            {divisionStatus.healthIndex}
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/100</span>
          </div>

          <div style={{ height: 6, background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-data)', marginTop: 'var(--spacing-2)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${divisionStatus.healthIndex}%`,
                background: 'var(--color-accent-success)',
                borderRadius: 'var(--radius-data)',
                transition: 'width 300ms ease-out',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--spacing-3)',
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-data)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Active TSRs</span>
          <span className="font-mono" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-accent-warning)' }}>
            {tsrs.length}
          </span>
        </div>

        <Link
          href="/workspace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            marginTop: 'var(--spacing-3)',
            color: 'var(--color-accent-operational)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          View TSR List <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
