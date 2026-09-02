'use client';

// =============================================================================
// ProposalList — Workspace Tab 1: Proposals List
// =============================================================================

import type { BlockProposal } from '@/types/railway';
import { ChevronRight } from 'lucide-react';

interface ProposalListProps {
  proposals: BlockProposal[];
  selectedProposalId: string | null;
  onSelectProposal: (id: string) => void;
  onOpenDrawer: (id: string) => void;
}

export default function ProposalList({
  proposals,
  selectedProposalId,
  onSelectProposal,
  onOpenDrawer,
}: ProposalListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 210px)',
        paddingRight: 'var(--spacing-1)',
      }}
    >
      {proposals.map((p) => {
        const isSelected = selectedProposalId === p.proposalId;
        const mostAffected = p.affectedTrains[0] || '12004';

        return (
          <div
            key={p.proposalId}
            onClick={() => onSelectProposal(p.proposalId)}
            style={{
              padding: 'var(--spacing-3)',
              background: isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-primary)',
              border: `1px solid ${isSelected ? 'var(--color-accent-operational)' : 'var(--color-border-default)'}`,
              borderRadius: 'var(--radius-panel)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
            }}
          >
            {/* Row 1: Tags & affected train */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span className={`dept-tag dept-tag--${p.department.toLowerCase()}`}>
                  {p.department}
                </span>
                <span className="status-tag status-tag--info">{p.status}</span>
              </div>

              <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-mono)' }}>
                Train #{mostAffected} ← affected
              </span>
            </div>

            {/* Row 2: Section & details */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div>
                <span className="font-mono" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  km {p.section.fromKm}–{p.section.toKm}
                </span>{' '}
                | {p.blockType} | {p.requestedDuration} min
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <span className="font-mono" style={{ color: 'var(--color-accent-success)', fontWeight: 700 }}>
                  Score: {p.aiPriorityScore.toFixed(2)}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer(p.proposalId);
                  }}
                  className="btn btn--secondary"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                  Review
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
