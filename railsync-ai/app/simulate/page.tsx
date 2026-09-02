'use client';

// =============================================================================
// Simulation Page (/simulate) — Dynamic Disruption Simulation Tool
// =============================================================================

import { useState } from 'react';
import SimulationControl from '@/components/simulate/SimulationControl';
import SimulationCanvas from '@/components/simulate/SimulationCanvas';
import SimulationResults from '@/components/simulate/SimulationResults';
import ApprovalDrawer from '@/components/shared/ApprovalDrawer';

export default function SimulatePage() {
  const [drawerProposalId, setDrawerProposalId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* Control Panel (Top full-width strip) */}
      <SimulationControl />

      {/* Full-width Simulation Canvas */}
      <SimulationCanvas onSelectProposal={(id) => setDrawerProposalId(id)} />

      {/* Results Panel (2-column grid) */}
      <SimulationResults />

      {/* Approval Drawer for deep dive on affected blocks */}
      <ApprovalDrawer
        isOpen={Boolean(drawerProposalId)}
        proposalId={drawerProposalId}
        onClose={() => setDrawerProposalId(null)}
      />
    </div>
  );
}
