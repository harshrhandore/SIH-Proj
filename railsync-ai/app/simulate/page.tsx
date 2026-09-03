'use client';

// =============================================================================
// Simulation Page (/simulate) — Dynamic Disruption Simulation Tool
// =============================================================================
// Responsive adaptations:
// - PHONE: Simplified control panel, text-based simulation summary card replacing
//          the complex canvas, stacked results.
// - TABLET: 280px height canvas, 1-column stacked results.
// - DESKTOP: Full-width canvas, 2-column results.
// =============================================================================

import { useState } from 'react';
import SimulationControl from '@/components/simulate/SimulationControl';
import SimulationCanvas from '@/components/simulate/SimulationCanvas';
import SimulationResults from '@/components/simulate/SimulationResults';
import ApprovalDrawer from '@/components/shared/ApprovalDrawer';
import { useNavMode } from '@/hooks/useNavMode';
import { useSimulationStore } from '@/store/simulationStore';
import { useOperationalStore } from '@/store/operationalStore';
import { Cpu, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SimulatePage() {
  const [drawerProposalId, setDrawerProposalId] = useState<string | null>(null);
  const navMode = useNavMode();

  const status = useSimulationStore((s) => s.status);
  const delayMinutes = useSimulationStore((s) => s.delayMinutes);
  const selectedTrainNumber = useSimulationStore((s) => s.selectedTrainNumber);
  const solveTimeMs = useSimulationStore((s) => s.solveTimeMs);
  const trains = useOperationalStore((s) => s.trains);
  const proposals = useOperationalStore((s) => s.proposals);

  const isMobile = navMode === 'mobile';
  const disruptedTrain = trains.find((t) => t.trainNumber === selectedTrainNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* Control Panel (Top full-width strip) */}
      <SimulationControl />

      {/* PHONE MODE: Text-based simulation summary card replaces Canvas */}
      {isMobile ? (
        <div
          className="panel"
          style={{
            padding: 'var(--spacing-4)',
            background: 'var(--color-bg-elevated)',
            border: '1.5px solid var(--color-border-strong)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent-operational)', fontWeight: 700, fontSize: 'var(--text-xs)' }}>
              <Zap size={14} />
              <span>SIMULATION TELEMETRY</span>
            </div>
            <span
              className="status-tag"
              style={{
                fontSize: '10px',
                background: status === 'complete' ? 'rgba(21, 128, 61, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                color: status === 'complete' ? 'var(--color-accent-success)' : 'var(--color-accent-operational)',
              }}
            >
              ● {status === 'complete' ? 'SOLVED' : status.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: 'var(--text-sm)' }}>
            <strong>Train #{selectedTrainNumber || '12004'}</strong> ({disruptedTrain?.trainName || 'Shatabdi Express'})
            <div className="font-mono" style={{ color: 'var(--color-accent-warning)', fontWeight: 700, marginTop: 2 }}>
              +{delayMinutes || 30} min delay injection
            </div>
          </div>

          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-data)',
              border: '1px solid var(--color-border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: 'var(--text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Block Rescheduled: </span>
              <strong>CIVIL km 287–309</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Original Window: </span>
              <span className="font-mono">14:30 IST</span> → <span className="font-mono" style={{ color: 'var(--color-accent-operational)' }}>15:15 IST (+45m)</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Net Punctuality Impact: </span>
              <strong style={{ color: 'var(--color-accent-success)' }}>+2 min on #12302</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              <Cpu size={12} style={{ color: 'var(--color-accent-operational)' }} />
              <span>CP-SAT engine solved in {solveTimeMs || 340}ms</span>
            </div>
          </div>

          <Link
            href="/workspace"
            style={{
              color: 'var(--color-accent-operational)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Review updated block slots in Workspace</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        /* TABLET & DESKTOP: Canvas */
        <div style={{ height: navMode === 'laptop' ? 280 : 380, width: '100%' }}>
          <SimulationCanvas onSelectProposal={(id) => setDrawerProposalId(id)} />
        </div>
      )}

      {/* Results Panel (Stacked on mobile, 2-col on desktop) */}
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
