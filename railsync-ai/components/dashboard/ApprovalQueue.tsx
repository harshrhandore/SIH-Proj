'use client';

// =============================================================================
// ApprovalQueue — Responsive Tabular / Card-Stack Proposal Queue
// =============================================================================
// Adaptations:
// - PHONE: Card-stack layout with touch-swipe actions, 8px gaps, 80px min-height
// - TABLET: 5-column table with horizontal scroll
// - DESKTOP/LAPTOP: Full sortable table
// =============================================================================

import { useState, useMemo, useRef } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import { ROLE_DEPARTMENT_MAP } from '@/types/permissions';
import type { BlockProposal } from '@/types/railway';
import { ArrowUpDown, Eye, Check, X, ArrowRight } from 'lucide-react';

type SortField = 'department' | 'section' | 'duration' | 'urgency' | 'score';
type SortDir = 'asc' | 'desc';

interface ApprovalQueueProps {
  onReviewProposal?: (proposalId: string) => void;
}

export default function ApprovalQueue({ onReviewProposal }: ApprovalQueueProps) {
  const proposals = useOperationalStore((s) => s.proposals);
  const user = useSessionStore((s) => s.user);
  const navMode = useNavMode();

  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const isSectionController = user?.role === 'ROLE_SC';
  const role = user?.role || 'ROLE_SC';
  const deptFilter = ROLE_DEPARTMENT_MAP[role];

  const pendingProposals = useMemo(() => {
    let filtered = proposals.filter(
      (p) =>
        p.status === 'PENDING' ||
        p.status === 'AI_RECOMMENDED' ||
        p.status === 'UNDER_REVIEW'
    );

    if (deptFilter) {
      filtered = filtered.filter((p) => p.department === deptFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'department':
          cmp = a.department.localeCompare(b.department);
          break;
        case 'section':
          cmp = a.section.fromKm - b.section.fromKm;
          break;
        case 'duration':
          cmp = a.requestedDuration - b.requestedDuration;
          break;
        case 'urgency': {
          const now = Date.now();
          const urgA = new Date(a.requestedStart).getTime() - now;
          const urgB = new Date(b.requestedStart).getTime() - now;
          cmp = urgA - urgB;
          break;
        }
        case 'score':
          cmp = a.aiPriorityScore - b.aiPriorityScore;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [proposals, deptFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const isMobile = navMode === 'mobile';

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          borderBottom: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Approval Queue
        </h2>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {pendingProposals.length} pending requests
        </span>
      </div>

      {pendingProposals.length === 0 ? (
        <div style={{ padding: 'var(--spacing-6)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          No pending proposals in queue.
        </div>
      ) : isMobile ? (
        /* PHONE MODE: Card Stack with Swipe Gestures */
        <div style={{ padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingProposals.map((p) => (
            <div
              key={p.proposalId}
              onClick={() => onReviewProposal?.(p.proposalId)}
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-panel)',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'border-color 150ms ease-out',
              }}
            >
              {/* Row 1: Dept + Status + Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`dept-tag dept-tag--${p.department.toLowerCase()}`}>
                    {p.department}
                  </span>
                  <span
                    className="status-tag"
                    style={{
                      background:
                        p.status === 'AI_RECOMMENDED'
                          ? 'rgba(2, 132, 199, 0.12)'
                          : 'rgba(180, 83, 9, 0.12)',
                      color:
                        p.status === 'AI_RECOMMENDED'
                          ? 'var(--color-accent-operational)'
                          : 'var(--color-accent-warning)',
                      fontSize: '10px',
                    }}
                  >
                    ● {p.status}
                  </span>
                </div>

                <span className="font-mono" style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-accent-operational)' }}>
                  Score: {p.aiPriorityScore.toFixed(2)}
                </span>
              </div>

              {/* Row 2: Section km | Duration | Work */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <span className="font-mono" style={{ color: 'var(--color-text-mono)', fontWeight: 600 }}>
                  km {p.section.fromKm}–{p.section.toKm} ({p.section.lineType})
                </span>
                <span>•</span>
                <span className="font-mono">{p.requestedDuration} min</span>
                <span>•</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {p.equipmentActivity}
                </span>
              </div>

              {/* Row 3: Action Link */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, paddingTop: 6, borderTop: '1px solid var(--color-border-default)' }}>
                <span style={{ color: 'var(--color-accent-operational)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Review Proposal <ArrowRight size={12} />
                </span>

                {isSectionController && (
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    Tap to review &amp; sign
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLET & DESKTOP: Sortable Responsive Table */
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('department')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Dept
                    <ArrowUpDown size={12} style={{ color: sortField === 'department' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)' }} />
                  </span>
                </th>
                <th onClick={() => toggleSort('section')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Section (km)
                    <ArrowUpDown size={12} style={{ color: sortField === 'section' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)' }} />
                  </span>
                </th>
                <th onClick={() => toggleSort('duration')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Duration
                    <ArrowUpDown size={12} style={{ color: sortField === 'duration' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)' }} />
                  </span>
                </th>
                <th onClick={() => toggleSort('urgency')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Urgency
                    <ArrowUpDown size={12} style={{ color: sortField === 'urgency' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)' }} />
                  </span>
                </th>
                <th onClick={() => toggleSort('score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Priority Score
                    <ArrowUpDown size={12} style={{ color: sortField === 'score' ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)' }} />
                  </span>
                </th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingProposals.map((p) => {
                const now = Date.now();
                const diffHours = (new Date(p.requestedStart).getTime() - now) / 3600000;
                const urgencyText = diffHours > 0 ? `${diffHours.toFixed(1)}h` : 'Overdue';

                return (
                  <tr key={p.proposalId}>
                    <td>
                      <span className={`dept-tag dept-tag--${p.department.toLowerCase()}`}>
                        {p.department}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" data-numeric="true">
                        km {p.section.fromKm}–{p.section.toKm}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginLeft: 4 }}>
                        {p.section.lineType}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" data-numeric="true">
                        {p.requestedDuration} min
                      </span>
                    </td>
                    <td>
                      <span
                        className="font-mono"
                        data-numeric="true"
                        style={{ color: diffHours < 4 ? 'var(--color-accent-warning)' : 'var(--color-text-secondary)' }}
                      >
                        {urgencyText}
                      </span>
                    </td>
                    <td>
                      <span
                        className="font-mono"
                        data-numeric="true"
                        style={{
                          color:
                            p.aiPriorityScore >= 0.7
                              ? 'var(--color-accent-success)'
                              : p.aiPriorityScore >= 0.5
                                ? 'var(--color-accent-warning)'
                                : 'var(--color-accent-critical)',
                        }}
                      >
                        {p.aiPriorityScore.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-tag"
                        style={{
                          background:
                            p.status === 'AI_RECOMMENDED'
                              ? 'rgba(2, 132, 199, 0.12)'
                              : 'rgba(180, 83, 9, 0.12)',
                          color:
                            p.status === 'AI_RECOMMENDED'
                              ? 'var(--color-accent-operational)'
                              : 'var(--color-accent-warning)',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onReviewProposal?.(p.proposalId)}
                        className="btn btn--ghost"
                        style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={12} />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
