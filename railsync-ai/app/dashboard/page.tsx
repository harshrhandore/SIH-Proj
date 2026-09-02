'use client';

// =============================================================================
// Dashboard Page (/dashboard)
// =============================================================================
// Operational Home Dashboard with:
// - 3 Operational Anchors (above the fold)
// - Primary Action Bar (1 CTA)
// - Approval Queue (below fold)
// - Recent Activity Feed
// =============================================================================

import { useState } from 'react';
import OperationalAnchors from '@/components/dashboard/OperationalAnchors';
import PrimaryActionBar from '@/components/dashboard/PrimaryActionBar';
import ApprovalQueue from '@/components/dashboard/ApprovalQueue';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ApprovalDrawer from '@/components/shared/ApprovalDrawer';

export default function DashboardPage() {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      {/* Above the fold: 3 Anchors */}
      <OperationalAnchors />

      {/* Primary Action Bar */}
      <PrimaryActionBar />

      {/* Below the fold: Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        {/* Approval Queue */}
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Approval Queue
            </h2>
          </div>
          <ApprovalQueue
            onReviewProposal={(id) => setSelectedProposalId(id)}
          />
        </div>

        {/* Recent Activity */}
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Recent Activity
            </h2>
          </div>
          <RecentActivity />
        </div>
      </div>

      {/* Disconnection Memo Approval Drawer */}
      <ApprovalDrawer
        isOpen={Boolean(selectedProposalId)}
        proposalId={selectedProposalId}
        onClose={() => setSelectedProposalId(null)}
      />
    </div>
  );
}
