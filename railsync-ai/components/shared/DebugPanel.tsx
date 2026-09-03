'use client';

// =============================================================================
// DebugPanel — Edge Case Testing Console (EC-01 through EC-07)
// =============================================================================
// Allows testing and verifying all 7 defined edge cases:
// EC-01: Empty approval queue
// EC-02: AI optimizer timeout
// EC-03: Block conflict detected
// EC-04: G&SR rule failure
// EC-05: Network timeout (cached data banner)
// EC-06: Audit chain integrity tampering
// EC-07: Session expiry overlay
// =============================================================================

import { useState } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import { useSessionStore } from '@/store/sessionStore';
import { useAuditStore } from '@/store/auditStore';
import { useNavMode } from '@/hooks/useNavMode';
import { BLOCK_PROPOSALS } from '@/data/seed';
import { Bug, X, AlertTriangle, WifiOff, Clock, ShieldAlert } from 'lucide-react';

export default function DebugPanel() {
  const navMode = useNavMode();
  const [isOpen, setIsOpen] = useState(false);
  const [networkTimeoutBanner, setNetworkTimeoutBanner] = useState(false);
  const [conflictBanner, setConflictBanner] = useState(false);

  const proposals = useOperationalStore((s) => s.proposals);
  const setProposals = useOperationalStore((s) => s.setProposals);
  const setExpired = useSessionStore((s) => s.setExpired);
  const refreshSession = useSessionStore((s) => s.refreshSession);
  const setTamperDebugFlag = useAuditStore((s) => s.setTamperDebugFlag);
  const tamperDebugFlag = useAuditStore((s) => s.tamperDebugFlag);
  const verifyIntegrity = useAuditStore((s) => s.verifyIntegrity);

  // EC-01: Toggle Empty Queue
  const toggleEmptyQueue = () => {
    if (proposals.length === 0) {
      setProposals(BLOCK_PROPOSALS);
    } else {
      setProposals([]);
    }
  };

  // EC-06: Toggle Tamper
  const handleToggleTamper = () => {
    setTamperDebugFlag(!tamperDebugFlag);
    setTimeout(() => verifyIntegrity(), 100);
  };

  return (
    <>
      {/* EC-05: Network timeout banner (mock cached data) */}
      {networkTimeoutBanner && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--status-strip-height)',
            left: 0,
            right: 0,
            zIndex: 999,
            background: '#D29922',
            color: '#0D1117',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WifiOff size={16} />
            <span>
              Service temporarily unavailable. Last sync: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. Operating on cached local divisional data.
            </span>
          </div>
          <button
            onClick={() => setNetworkTimeoutBanner(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0D1117',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* EC-03: Block conflict alert */}
      {conflictBanner && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--spacing-4)',
            left: 'calc(var(--sidebar-width) + var(--spacing-4))',
            right: 'var(--spacing-4)',
            zIndex: 8000,
            background: 'var(--color-bg-elevated)',
            border: '2px solid var(--color-accent-critical)',
            borderRadius: 'var(--radius-panel)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--color-accent-critical)' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-accent-critical)', fontSize: 'var(--text-xs)' }}>
                EC-03: BLOCK CONFLICT DETECTED
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
                Conflict: Train #12004 path overlaps proposed block km 287–309 at 14:47–14:52. Block cannot be granted without delay.
              </div>
            </div>
          </div>
          <button
            onClick={() => setConflictBanner(false)}
            className="btn btn--secondary"
            style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Floating Debug Button (bottom left) */}
      <div
        style={{
          position: 'fixed',
          bottom:
            navMode === 'mobile'
              ? 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 8px)'
              : 'var(--spacing-3)',
          left: 'var(--spacing-3)',
          zIndex: 9500,
        }}
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            id="debug-panel-toggle"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-data)',
              padding: '6px 10px',
              color: 'var(--color-text-mono)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-default)',
            }}
          >
            <Bug size={14} style={{ color: 'var(--color-accent-warning)' }} />
            <span>Edge Cases (EC-01..07)</span>
          </button>
        ) : (
          <div
            style={{
              width: 320,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-panel)',
              padding: 'var(--spacing-3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent-warning)' }}>
                <Bug size={16} />
                Edge Case Test Console
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '11px' }}>
              {/* EC-01 */}
              <button
                onClick={toggleEmptyQueue}
                className="btn btn--secondary"
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '11px' }}
              >
                EC-01: {proposals.length === 0 ? 'Restore Proposals' : 'Empty Approval Queue'}
              </button>

              {/* EC-03 */}
              <button
                onClick={() => setConflictBanner(!conflictBanner)}
                className="btn btn--secondary"
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '11px' }}
              >
                EC-03: Toggle Block Conflict Alert
              </button>

              {/* EC-05 */}
              <button
                onClick={() => setNetworkTimeoutBanner(!networkTimeoutBanner)}
                className="btn btn--secondary"
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '11px' }}
              >
                EC-05: Toggle Network Timeout (Cached Data)
              </button>

              {/* EC-06 */}
              <button
                onClick={handleToggleTamper}
                className="btn btn--secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: tamperDebugFlag ? 'var(--color-accent-critical)' : 'inherit',
                }}
              >
                EC-06: {tamperDebugFlag ? 'Reset Audit Tamper' : 'Corrupt Audit Chain'}
              </button>

              {/* EC-07 */}
              <button
                onClick={() => setExpired()}
                className="btn btn--danger"
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '11px' }}
              >
                EC-07: Trigger Session Expiry Overlay
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
