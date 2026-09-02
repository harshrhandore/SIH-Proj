'use client';

// =============================================================================
// MareyDiagram Component — Interactive Time-Distance Graph
// =============================================================================

import { useEffect, useRef } from 'react';
import { useMareyDiagram } from '@/hooks/useMareyDiagram';
import type { TrainService, BlockProposal } from '@/types/railway';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MareyDiagramProps {
  trains: TrainService[];
  proposals: BlockProposal[];
  selectedProposalId: string | null;
  onSelectProposal: (proposalId: string) => void;
}

export default function MareyDiagram({
  trains,
  proposals,
  selectedProposalId,
  onSelectProposal,
}: MareyDiagramProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { canvasRef, hoveredBlock, zoom, setZoom, setPanX, events } = useMareyDiagram({
    trains,
    proposals,
    selectedProposalId,
    onSelectBlock: onSelectProposal,
  });

  // Handle dynamic canvas sizing & High DPI
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 520,
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-panel)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <canvas
        ref={canvasRef}
        {...events}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: hoveredBlock ? 'pointer' : 'grab',
        }}
      />

      {/* Diagram Controls overlay */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-3)',
          right: 'var(--spacing-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-1)',
          background: 'rgba(22, 27, 34, 0.85)',
          padding: '4px',
          borderRadius: 'var(--radius-data)',
          border: '1px solid var(--color-border-default)',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))}
          className="btn btn--ghost"
          style={{ padding: '4px 6px', minWidth: 'auto' }}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z / 1.2))}
          className="btn btn--ghost"
          style={{ padding: '4px 6px', minWidth: 'auto' }}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPanX(0);
          }}
          className="btn btn--ghost"
          style={{ padding: '4px 6px', minWidth: 'auto' }}
          title="Reset View"
        >
          <RotateCcw size={14} />
        </button>
        <span
          className="font-mono"
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            padding: '0 4px',
          }}
        >
          {(zoom * 100).toFixed(0)}%
        </span>
      </div>

      {/* Hover Tooltip for Block Proposals */}
      {hoveredBlock && (
        <div
          style={{
            position: 'fixed',
            top: hoveredBlock.y + 12,
            left: hoveredBlock.x + 12,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-panel)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            boxShadow: 'var(--shadow-default)',
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: 'var(--text-xs)',
            maxWidth: 280,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-accent-operational)', marginBottom: 2 }}>
            AI Recommended Slot — {hoveredBlock.proposal.proposalId}
          </div>
          <div style={{ color: 'var(--color-text-primary)' }}>
            Priority Score:{' '}
            <strong className="font-mono" style={{ color: 'var(--color-accent-success)' }}>
              {hoveredBlock.proposal.aiPriorityScore.toFixed(2)}
            </strong>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Impact: +{hoveredBlock.proposal.punctualityImpactMinutes} min on #
            {hoveredBlock.proposal.affectedTrains[0] || '12004'}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Bundled: {hoveredBlock.proposal.department} + {hoveredBlock.proposal.blockType}
          </div>
          <div style={{ color: 'var(--color-text-mono)', fontSize: '10px', marginTop: 4 }}>
            Click to review disconnection memo →
          </div>
        </div>
      )}
    </div>
  );
}
