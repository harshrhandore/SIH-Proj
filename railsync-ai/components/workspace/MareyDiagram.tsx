'use client';

// =============================================================================
// MareyDiagram Component — Interactive Time-Distance Graph
// =============================================================================
// Features:
// - HTML5 Canvas with devicePixelRatio scaling for Retina / high-DPI
// - Touch & pointer events: drag pan, pinch-to-zoom, tap block, tap train path
// - Screen reader accessibility: aria-label + hidden data table alternative
// - Non-intrusive device performance banner
// - Train tap detail floating overlay
// =============================================================================

import { useEffect, useRef } from 'react';
import { useMareyDiagram } from '@/hooks/useMareyDiagram';
import { usePerformanceStore } from '@/store/performanceStore';
import type { TrainService, BlockProposal } from '@/types/railway';
import { ZoomIn, ZoomOut, RotateCcw, X, Info, Gauge } from 'lucide-react';

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
  const isLowPerformance = usePerformanceStore((s) => s.isLowPerformance);

  const {
    canvasRef,
    hoveredBlock,
    selectedTrain,
    setSelectedTrain,
    zoom,
    setZoom,
    setPanX,
    events,
  } = useMareyDiagram({
    trains,
    proposals,
    selectedProposalId,
    onSelectBlock: onSelectProposal,
  });



  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 340,
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-panel)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
        touchAction: 'none',
      }}
    >
      {/* Screen Reader Accessible Data Alternative */}
      <div
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        <table aria-hidden="false">
          <caption>Time-distance train graph for Ghaziabad–Kanpur corridor</caption>
          <thead>
            <tr>
              <th>Train Number</th>
              <th>Service</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Current Delay</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((t) => (
              <tr key={t.trainNumber}>
                <td>{t.trainNumber}</td>
                <td>{t.trainName}</td>
                <td>{t.scheduledDeparture}</td>
                <td>{t.scheduledArrival}</td>
                <td>{t.currentDelayMinutes} min</td>
                <td>Priority {t.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        {...events}
        aria-label="Time-distance train graph for Ghaziabad–Kanpur corridor"
        role="img"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'grab',
          touchAction: 'none',
        }}
      />

      {/* Low-Performance Mode Badge */}
      {isLowPerformance && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '3px 8px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-data)',
            color: '#F1F5F9',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            pointerEvents: 'none',
          }}
        >
          <Gauge size={12} style={{ color: '#F59E0B' }} />
          <span>Performance Mode Active (Animations Reduced)</span>
        </div>
      )}

      {/* Controls: Zoom and Reset */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
          gap: 6,
          background: 'var(--color-bg-elevated)',
          padding: 4,
          borderRadius: 'var(--radius-data)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-default)',
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(4.0, z * 1.2))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-data)',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Zoom In (Pinch also supported)"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z * 0.8))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-data)',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setPanX(0);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-data)',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reset Zoom & Pan"
          aria-label="Reset Zoom & Pan"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Train Tap Details Popover */}
      {selectedTrain && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-panel)',
            padding: 'var(--spacing-3)',
            maxWidth: 260,
            boxShadow: 'var(--shadow-elevated)',
            zIndex: 20,
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="font-mono" style={{ fontWeight: 700, color: 'var(--color-accent-operational)', fontSize: '13px' }}>
              Train #{selectedTrain.train.trainNumber}
            </span>
            <button
              onClick={() => setSelectedTrain(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedTrain.train.trainName}</div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedTrain.train.serviceType}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--color-border-default)' }}>
            <span>Delay:</span>
            <strong style={{ color: selectedTrain.train.currentDelayMinutes > 0 ? 'var(--color-accent-warning)' : 'var(--color-accent-success)' }}>
              +{selectedTrain.train.currentDelayMinutes} min
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Priority Class:</span>
            <strong>P{selectedTrain.train.priority}</strong>
          </div>
        </div>
      )}

      {/* Hover Tooltip for Block Proposals (Desktop) */}
      {hoveredBlock && (
        <div
          style={{
            position: 'fixed',
            left: hoveredBlock.x + 12,
            top: hoveredBlock.y - 12,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-data)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            boxShadow: 'var(--shadow-elevated)',
            pointerEvents: 'none',
            zIndex: 100,
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {hoveredBlock.proposal.department} Block #{hoveredBlock.proposal.proposalId}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
            km {hoveredBlock.proposal.section.fromKm}–{hoveredBlock.proposal.section.toKm} • {hoveredBlock.proposal.requestedDuration} min
          </div>
          <div style={{ color: 'var(--color-accent-operational)', marginTop: 2, fontWeight: 500 }}>
            Status: {hoveredBlock.proposal.status}
          </div>
        </div>
      )}
    </div>
  );
}
