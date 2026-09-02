'use client';

// =============================================================================
// ApprovalQueue — Compact tabular list of pending proposals
// =============================================================================
// Sortable columns: Dept | Section | Duration | Urgency | Priority Score
// Inline [Review] button opens the Approval Drawer.
// =============================================================================

import { useState, useMemo } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { ROLE_DEPARTMENT_MAP } from '@/types/permissions';
import type { BlockProposal } from '@/types/railway';
import { ArrowUpDown, Eye } from 'lucide-react';

type SortField = 'department' | 'section' | 'duration' | 'urgency' | 'score';
type SortDir = 'asc' | 'desc';

interface ApprovalQueueProps {
  onReviewProposal?: (proposalId: string) => void;
}

export default function ApprovalQueue({ onReviewProposal }: ApprovalQueueProps) {
  const proposals = useOperationalStore((s) => s.proposals);
  const user = useSessionStore((s) => s.user);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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

  const getStatusColor = (status: BlockProposal['status']) => {
    switch (status) {
      case 'PENDING': return 'var(--color-accent-warning)';
      case 'AI_RECOMMENDED': return 'var(--color-accent-operational)';
      case 'UNDER_REVIEW': return 'var(--color-accent-warning)';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (pendingProposals.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        No pending proposals. System nominal.
      </div>
    );
  }

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => toggleSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <ArrowUpDown
          size={12}
          style={{
            color: sortField === field ? 'var(--color-accent-operational)' : 'var(--color-text-secondary)',
          }}
        />
      </span>
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ops-table">
        <thead>
          <tr>
            <SortHeader field="department" label="Dept" />
            <SortHeader field="section" label="Section (km)" />
            <SortHeader field="duration" label="Duration" />
            <SortHeader field="urgency" label="Urgency" />
            <SortHeader field="score" label="Priority Score" />
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingProposals.map((p) => {
            const now = Date.now();
            const startTime = new Date(p.requestedStart).getTime();
            const hoursLeft = Math.max(0, (startTime - now) / 3600000);

            return (
              <tr key={p.proposalId}>
                <td>
                  <span className={`dept-tag dept-tag--${p.department.toLowerCase()}`}>
                    {p.department}
                  </span>
                </td>
                <td>
                  <span className="font-mono" data-numeric>
                    km {p.section.fromKm}–{p.section.toKm}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginLeft: 4 }}>
                    {p.section.lineType}
                  </span>
                </td>
                <td>
                  <span className="font-mono" data-numeric>
                    {p.requestedDuration} min
                  </span>
                </td>
                <td>
                  <span
                    className="font-mono"
                    data-numeric
                    style={{
                      color: hoursLeft < 2
                        ? 'var(--color-accent-critical)'
                        : hoursLeft < 4
                          ? 'var(--color-accent-warning)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {hoursLeft.toFixed(1)}h
                  </span>
                </td>
                <td>
                  <span
                    className="font-mono"
                    data-numeric
                    style={{
                      color: p.aiPriorityScore >= 0.7
                        ? 'var(--color-accent-success)'
                        : p.aiPriorityScore >= 0.4
                          ? 'var(--color-accent-warning)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {p.aiPriorityScore.toFixed(2)}
                  </span>
                </td>
                <td>
                  <span
                    className="status-tag"
                    style={{
                      background: `${getStatusColor(p.status)}15`,
                      color: getStatusColor(p.status),
                    }}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn--ghost"
                    onClick={() => onReviewProposal?.(p.proposalId)}
                    style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
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
  );
}
