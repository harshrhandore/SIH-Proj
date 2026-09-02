'use client';

// =============================================================================
// OperationalAnchors — 3 anchors + Corridor Health panel
// =============================================================================
// Anchor 1: Pending Joint Block Proposals (filtered by role)
// Anchor 2: Next Approved Block Window
// Anchor 3: Corridor Health Index
// =============================================================================

import { useMemo } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { ROLE_DEPARTMENT_MAP } from '@/types/permissions';
import { DEPARTMENT_LABELS } from '@/types/railway';
import { Clock, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OperationalAnchors() {
  const proposals = useOperationalStore((s) => s.proposals);
  const divisionStatus = useOperationalStore((s) => s.divisionStatus);
  const user = useSessionStore((s) => s.user);
  const tsrs = useOperationalStore((s) => s.tsrs);

  const role = user?.role || 'ROLE_SC';
  const deptFilter = ROLE_DEPARTMENT_MAP[role];

  const nextBlock = useMemo(() => {
    const now = new Date();
    return proposals
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
      )[0] || null;
  }, [proposals]);
  // Pending proposals filtered by role
  const pendingProposals = proposals.filter(
    (p) =>
      (p.status === 'PENDING' || p.status === 'AI_RECOMMENDED' || p.status === 'UNDER_REVIEW') &&
      (!deptFilter || p.department === deptFilter)
  );

  // Calculate urgency for highest priority pending proposal
  const highestUrgency = pendingProposals.length > 0
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
    : null;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: false,
    });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--spacing-4)' }}>
      {/* Left column: Anchors 1 & 2 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {/* Anchor 1: Pending Joint Block Proposals */}
        <div className="panel" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-accent-warning)' }} />
            <h3 style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}>
              {deptFilter
                ? `Pending ${DEPARTMENT_LABELS[deptFilter]} Proposals`
                : 'Pending Joint Block Proposals'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--spacing-2)',
            }}>
              <span className="font-mono" style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: pendingProposals.length > 0
                  ? 'var(--color-accent-warning)'
                  : 'var(--color-accent-success)',
              }}>
                {pendingProposals.length}
              </span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Pending
              </span>
            </div>

            {highestUrgency && (
              <>
                <span style={{ color: 'var(--color-border-strong)' }}>|</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Highest urgency:{' '}
                  <span className="font-mono" style={{ color: 'var(--color-accent-warning)' }}>
                    {highestUrgency}
                  </span>
                </span>
              </>
            )}
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
            <h3 style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}>
              Next Approved Block Window
            </h3>
          </div>

          {nextBlock ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                <span className="font-mono" style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--color-accent-success)',
                }}>
                  {formatTime(nextBlock.actualGrantedStart!)} – {formatTime(
                    new Date(
                      new Date(nextBlock.actualGrantedStart!).getTime() +
                        (nextBlock.actualGrantedDuration || nextBlock.requestedDuration) * 60000
                    ).toISOString()
                  )} IST
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
                {nextBlock.blockType === 'JOINT' && (
                  <span className="status-tag status-tag--info">JOINT</span>
                )}
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {nextBlock.equipmentActivity.substring(0, 60)}...
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
                Review Block Details <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              No upcoming approved blocks. System nominal.
            </p>
          )}
        </div>
      </div>

      {/* Right column: Anchor 3 — Corridor Health */}
      <div className="panel" style={{ padding: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
          <Activity size={16} style={{ color: 'var(--color-accent-success)' }} />
          <h3 style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            Corridor Health Index
          </h3>
        </div>

        {/* Health score */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
          <div className="font-mono" style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: divisionStatus.healthIndex >= 80
              ? 'var(--color-accent-success)'
              : divisionStatus.healthIndex >= 60
                ? 'var(--color-accent-warning)'
                : 'var(--color-accent-critical)',
          }}>
            {divisionStatus.healthIndex}
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
              /100
            </span>
          </div>

          {/* Simple health bar */}
          <div style={{
            height: 6,
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-data)',
            marginTop: 'var(--spacing-2)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${divisionStatus.healthIndex}%`,
              background: divisionStatus.healthIndex >= 80
                ? 'var(--color-accent-success)'
                : divisionStatus.healthIndex >= 60
                  ? 'var(--color-accent-warning)'
                  : 'var(--color-accent-critical)',
              borderRadius: 'var(--radius-data)',
              transition: 'width 300ms ease-out',
            }} />
          </div>
        </div>

        {/* TSR count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-3)',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-data)',
        }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Active TSRs
          </span>
          <span className="font-mono" style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-accent-warning)',
          }}>
            {tsrs.filter(t => t.isActive).length}
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
