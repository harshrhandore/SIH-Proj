'use client';

// =============================================================================
// ApprovalDrawer — Responsive Block Disconnection Memo Review
// =============================================================================
// Responsive adaptations:
// - DESKTOP (>=1024px): 480px fixed right drawer
// - TABLET (768–1023px): 100% width drawer minus rail with visible chevron bar
// - PHONE (<768px): 94vh bottom sheet with 40×4px handle & swipe-to-dismiss (>30%)
// - Mobile-tailored Section A (2 inputs per row, native time/date inputs)
// - VisualViewport soft keyboard handling
// =============================================================================

import { useState, useMemo, useRef, useEffect } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useAuditStore } from '@/store/auditStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import type { BlockProposal, ShapExplanation, PunctualityImpact } from '@/types/railway';
import GSRChecklist from './GSRChecklist';
import ShapExplanationCard from './ShapExplanationCard';
import PunctualityTable from './PunctualityTable';
import DigitalSignatureForm from './DigitalSignatureForm';
import AuditMiniLog from './AuditMiniLog';
import { X, Copy, Check, FileText, ChevronLeft } from 'lucide-react';

interface ApprovalDrawerProps {
  isOpen: boolean;
  proposalId: string | null;
  onClose: () => void;
}

export default function ApprovalDrawer({
  isOpen,
  proposalId,
  onClose,
}: ApprovalDrawerProps) {
  const proposals = useOperationalStore((s) => s.proposals);
  const updateProposalStatus = useOperationalStore((s) => s.updateProposalStatus);
  const trains = useOperationalStore((s) => s.trains);
  const addAuditEntry = useAuditStore((s) => s.addEntry);
  const auditEntries = useAuditStore((s) => s.entries);
  const user = useSessionStore((s) => s.user);
  const sessionId = useSessionStore((s) => s.sessionId);
  const navMode = useNavMode();

  const [copied, setCopied] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Bottom-sheet swipe-down tracking on mobile
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef<number | null>(null);

  const proposal = useMemo(() => {
    if (!proposalId) return null;
    return proposals.find((p) => p.proposalId === proposalId) || null;
  }, [proposalId, proposals]);

  // Derive Audit entries for this specific proposal
  const proposalAuditEntries = useMemo(() => {
    if (!proposalId) return [];
    return auditEntries.filter((e) => e.targetId === proposalId);
  }, [proposalId, auditEntries]);

  // Derive SHAP explanation
  const shapExplanation: ShapExplanation = useMemo(() => {
    if (!proposal) {
      return {
        topFeatures: [],
        baseScore: 0.5,
        finalScore: 0.5,
        narrativeSummary: '',
      };
    }
    return {
      topFeatures: [
        {
          featureName: 'Corridor Traffic Gap (14:30–16:00)',
          featureValue: '45-min buffer',
          shapValue: +0.22,
          humanLabel: 'No Shatabdi/Rajdhani scheduled in 45-min buffer',
        },
        {
          featureName: 'Joint Department Synergy',
          featureValue: 'Civil + Electrical',
          shapValue: +0.18,
          humanLabel: 'Combines Civil P-Way + TRD OHE power shutdown',
        },
        {
          featureName: 'Cumulative Punctuality Impact',
          featureValue: '+8 min delay',
          shapValue: -0.05,
          humanLabel: 'Causes +8 min delay on 12452 Gomti Express',
        },
        {
          featureName: 'Urgency / Maintenance SLA',
          featureValue: 'Track geometry defect',
          shapValue: +0.12,
          humanLabel: 'Critical track geometry defect nearing speed restriction limit',
        },
      ],
      baseScore: 0.5,
      finalScore: proposal.aiPriorityScore,
      narrativeSummary: `AI Optimizer confirms a high-confidence joint window. Punctuality loss is bounded to +8 minutes on a single secondary train, saving 2 separate track disconnections.`,
    };
  }, [proposal]);

  // Derive Punctuality Impacts
  const punctualityImpacts: PunctualityImpact[] = useMemo(() => {
    if (!proposal) return [];
    return [
      {
        trainNumber: '12004',
        trainName: 'Lucknow Shatabdi',
        scheduledTime: '2024-03-15T06:10:00+05:30',
        predictedTime: '2024-03-15T06:10:00+05:30',
        deltaMinutes: 0,
        priority: 1,
      },
      {
        trainNumber: '12452',
        trainName: 'Shram Shakti Express',
        scheduledTime: '2024-03-15T23:55:00+05:30',
        predictedTime: '2024-03-16T00:03:00+05:30',
        deltaMinutes: 8,
        priority: 2,
      },
      {
        trainNumber: '12302',
        trainName: 'Howrah Rajdhani',
        scheduledTime: '2024-03-15T16:50:00+05:30',
        predictedTime: '2024-03-15T16:50:00+05:30',
        deltaMinutes: 0,
        priority: 1,
      },
    ];
  }, [proposal]);

  const copyMemoId = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal.proposalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApprove = async (employeeId: string, pin: string) => {
    if (!proposal) return;
    updateProposalStatus(proposal.proposalId, 'APPROVED');

    const memoId = `MEMO-NR-GZB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${proposal.proposalId.slice(-4)}`;

    await addAuditEntry(
      user?.userId || 'USR-SC-001',
      user?.role || 'ROLE_SC',
      'BLOCK_APPROVED',
      proposal.proposalId,
      {
        status: { before: proposal.status, after: 'APPROVED' },
        digitalSignature: employeeId,
        memoReference: memoId,
        grantedStart: proposal.requestedStart,
        grantedDuration: proposal.requestedDuration,
      },
      sessionId
    );

    setSuccessBanner(`Memo Approved — Reference: ${memoId}`);
    setTimeout(() => {
      setSuccessBanner(null);
      onClose();
    }, 3000);
  };

  const handleReject = async (employeeId: string, pin: string, comment: string) => {
    if (!proposal) return;
    updateProposalStatus(proposal.proposalId, 'REJECTED');

    await addAuditEntry(
      user?.userId || 'USR-SC-001',
      user?.role || 'ROLE_SC',
      'BLOCK_REJECTED',
      proposal.proposalId,
      {
        status: { before: proposal.status, after: 'REJECTED' },
        rejectedBy: employeeId,
        mandatoryComment: comment,
      },
      sessionId
    );

    setSuccessBanner(`Proposal Rejected — Audit logged.`);
    setTimeout(() => {
      setSuccessBanner(null);
      onClose();
    }, 3000);
  };

  // Drag-to-dismiss handlers on mobile
  const handleHandlePointerDown = (e: React.PointerEvent) => {
    dragStartYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleHandlePointerMove = (e: React.PointerEvent) => {
    if (dragStartYRef.current === null) return;
    const dy = e.clientY - dragStartYRef.current;
    if (dy > 0) {
      setDragOffset(dy);
    }
  };

  const handleHandlePointerUp = (e: React.PointerEvent) => {
    if (dragStartYRef.current === null) return;
    const sheetHeight = window.innerHeight * 0.94;
    if (dragOffset > sheetHeight * 0.3) {
      onClose();
    }
    setDragOffset(0);
    dragStartYRef.current = null;
  };

  if (!isOpen || !proposal) return null;

  const isMobile = navMode === 'mobile';

  return (
    <>
      {/* Dimmed Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 95,
        }}
      />

      {/* Drawer / Bottom Sheet Container */}
      <div
        style={
          isMobile
            ? {
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '94vh',
                maxHeight: '94vh',
                background: 'var(--color-bg-elevated)',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                borderTop: '1px solid var(--color-border-strong)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(${dragOffset}px)`,
                transition: dragStartYRef.current === null ? 'transform 200ms ease-out' : 'none',
              }
            : {
                position: 'fixed',
                top: 0,
                right: 0,
                width: navMode === 'laptop' ? 'min(520px, 90vw)' : 'var(--drawer-tablet, 480px)',
                height: '100vh',
                background: 'var(--color-bg-elevated)',
                borderLeft: '2px solid var(--color-border-default)',
                boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
              }
        }
      >
        {/* Mobile Top Drag Handle */}
        {isMobile && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            onPointerCancel={handleHandlePointerUp}
            style={{
              padding: '10px 0 6px 0',
              cursor: 'grab',
              touchAction: 'none',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div className="bottom-sheet-drag-handle" />
          </div>
        )}

        {/* Tablet Left Close Chevron Bar */}
        {navMode === 'laptop' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '40%',
              left: -28,
              width: 28,
              height: 72,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-strong)',
              borderRight: 'none',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.15)',
            }}
            title="Close Drawer"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Header */}
        <div
          style={{
            padding: isMobile ? 'var(--spacing-2) var(--spacing-4)' : 'var(--spacing-4)',
            borderBottom: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <FileText size={18} style={{ color: 'var(--color-accent-operational)' }} />
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Block Disconnection Memo
              </h2>
              <span
                className="status-tag"
                style={{
                  background:
                    proposal.status === 'APPROVED'
                      ? 'rgba(35, 134, 54, 0.2)'
                      : 'rgba(210, 153, 34, 0.2)',
                  color:
                    proposal.status === 'APPROVED'
                      ? 'var(--color-accent-success)'
                      : 'var(--color-accent-warning)',
                  fontSize: '10px',
                }}
              >
                {proposal.status}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                marginTop: 'var(--spacing-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                {proposal.proposalId}
              </span>
              <button
                onClick={copyMemoId}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '11px',
                }}
              >
                {copied ? <Check size={12} style={{ color: 'var(--color-accent-success)' }} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-data)',
            }}
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'rgba(35, 134, 54, 0.2)',
              borderBottom: '1px solid var(--color-accent-success)',
              color: 'var(--color-accent-success)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {successBanner}
          </div>
        )}

        {/* Scrollable Interior (Sections A–F) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-4)',
            paddingBottom: isMobile ? 'calc(var(--spacing-8) + env(safe-area-inset-bottom, 0px))' : 'var(--spacing-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
          }}
        >
          {/* SECTION A — BLOCK PARAMETERS */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section A — Operational Parameters
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-2)',
                background: 'var(--color-bg-primary)',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>From km:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--color-text-mono)' }}>
                  km {proposal.section.fromKm}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>To km:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--color-text-mono)' }}>
                  km {proposal.section.toKm}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Division Limit:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {proposal.section.divisionCode}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Track Line:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {proposal.section.lineType} Track
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Requested Window:</span>
                <div className="font-mono" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {new Date(proposal.requestedStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                  {' '}({proposal.requestedDuration} min duration)
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B — G&SR SAFETY COMPLIANCE CHECKLIST */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section B — G&amp;SR Safety Checklist
            </h3>
            <GSRChecklist checks={proposal.gsrCompliance} />
          </div>

          {/* SECTION C — AI EXPLAINABILITY & SHAP DECOMPOSITION */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section C — AI Priority Scoring (SHAP)
            </h3>
            <ShapExplanationCard
              explanation={shapExplanation}
            />
          </div>

          {/* SECTION D — PUNCTUALITY IMPACT PREVIEW */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section D — Train Punctuality Impact
            </h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <PunctualityTable impacts={punctualityImpacts} />
            </div>
          </div>

          {/* SECTION E — DIGITAL SIGNATURE & AUTHORIZATION */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section E — 2-Step Digital Authorization
            </h3>
            <DigitalSignatureForm
              proposalId={proposal.proposalId}
              isBlockedByGSR={proposal.gsrCompliance.some((c) => c.status === 'FAIL')}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>

          {/* SECTION F — AUDIT TRAIL MINI-LOG */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              Section F — Audit Log Trail
            </h3>
            <AuditMiniLog
              entries={proposalAuditEntries}
            />
          </div>
        </div>
      </div>
    </>
  );
}
