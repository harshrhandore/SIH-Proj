'use client';

// =============================================================================
// SimulationCanvas — Full-width Marey Canvas with Before/After Diff
// =============================================================================

import { useOperationalStore } from '@/store/operationalStore';
import { useSimulationStore } from '@/store/simulationStore';
import MareyDiagram from '@/components/workspace/MareyDiagram';

interface SimulationCanvasProps {
  onSelectProposal?: (id: string) => void;
}

export default function SimulationCanvas({ onSelectProposal }: SimulationCanvasProps) {
  const trains = useOperationalStore((s) => s.trains);
  const proposals = useOperationalStore((s) => s.proposals);
  const status = useSimulationStore((s) => s.status);
  const solveTimeMs = useSimulationStore((s) => s.solveTimeMs);

  return (
    <div style={{ position: 'relative', width: '100%', height: 480 }}>
      <MareyDiagram
        trains={trains}
        proposals={proposals}
        selectedProposalId={null}
        onSelectProposal={onSelectProposal || (() => {})}
      />

      {/* Status Badge in canvas corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--spacing-3)',
          right: 'var(--spacing-3)',
          background: 'rgba(22, 27, 34, 0.9)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-data)',
          padding: '6px 12px',
          fontSize: 'var(--text-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}
      >
        <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
        <span
          className="font-mono"
          style={{
            fontWeight: 700,
            color:
              status === 'running'
                ? 'var(--color-accent-warning)'
                : status === 'complete'
                  ? 'var(--color-accent-success)'
                  : 'var(--color-text-secondary)',
          }}
        >
          {status === 'running'
            ? 'Running OR-Tools CP-SAT Optimization...'
            : status === 'complete'
              ? `Results Ready (${(solveTimeMs / 1000).toFixed(1)}s)`
              : 'No Simulation Active (Nominal Flow)'}
        </span>
      </div>
    </div>
  );
}
