'use client';

// =============================================================================
// PrimaryActionBar — Full-width Action Bar
// =============================================================================
// Responsive adaptations:
// - PHONE: Full-width primary blue button (52px tall), simulation trigger hidden
// - TABLET: Stacks button and simulation dropdown vertically
// - LAPTOP: Compressed label "AI Optimizer" (drop "Launch" prefix)
// - DESKTOP: Standard full bar
// =============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/store/sessionStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavMode } from '@/hooks/useNavMode';
import { PermissionAction } from '@/types/permissions';
import { Zap, Plus, ChevronDown } from 'lucide-react';

export default function PrimaryActionBar() {
  const user = useSessionStore((s) => s.user);
  const navMode = useNavMode();
  const { allowed: canLaunchOptimizer } = usePermissions(PermissionAction.LAUNCH_AI_OPTIMIZER);
  const { allowed: canSubmitRequest } = usePermissions(PermissionAction.SUBMIT_BLOCK_REQUEST);
  const { allowed: canTriggerSim } = usePermissions(PermissionAction.TRIGGER_SIMULATION);
  const [simDropdownOpen, setSimDropdownOpen] = useState(false);

  const isMobile = navMode === 'mobile';
  const isLaptop = navMode === 'laptop';

  // PHONE MODE: Single full-width 52px blue action button
  if (isMobile) {
    return (
      <div style={{ width: '100%' }}>
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <button
            className="btn btn--primary"
            id="launch-optimizer-btn"
            style={{
              width: '100%',
              height: '52px',
              justifyContent: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
            }}
          >
            <Zap size={18} />
            <span>Review Pending Blocks</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--spacing-3) var(--spacing-4)',
        background: 'var(--color-bg-elevated)',
        borderTop: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-panel)',
        minHeight: 52,
        flexWrap: 'wrap',
        gap: 'var(--spacing-2)',
      }}
    >
      {/* Primary CTA */}
      {canLaunchOptimizer ? (
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <button className="btn btn--primary" id="launch-optimizer-btn" style={{ minHeight: '44px' }}>
            <Zap size={16} />
            {isLaptop ? 'AI Optimizer — Joint Windows' : 'Launch AI Optimizer — Review Pending Joint Windows'}
          </button>
        </Link>
      ) : canSubmitRequest ? (
        <button className="btn btn--primary" id="submit-request-btn" style={{ minHeight: '44px' }}>
          <Plus size={16} />
          Submit New Block Request
        </button>
      ) : (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          No primary actions available for current role.
        </span>
      )}

      {/* Simulation trigger (Laptop & Desktop) */}
      <div style={{ position: 'relative' }}>
        {canTriggerSim ? (
          <>
            <button
              className="btn btn--secondary"
              id="inject-delay-btn"
              onClick={() => setSimDropdownOpen(!simDropdownOpen)}
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Inject Delay
              <ChevronDown
                size={14}
                style={{
                  transform: simDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms ease-out',
                }}
              />
            </button>

            {simDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 'calc(100% + 4px)',
                  width: 260,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-panel)',
                  padding: 'var(--spacing-2)',
                  zIndex: 20,
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                <div style={{ padding: 'var(--spacing-2)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Quick Disruption Scenarios
                </div>
                <Link
                  href="/simulate?train=12004&delay=30"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => setSimDropdownOpen(false)}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-data)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>Train #12004</strong> — +30 min at GZB
                  </div>
                </Link>
                <Link
                  href="/simulate?train=12452&delay=45"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => setSimDropdownOpen(false)}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-data)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>Train #12452</strong> — +45 min at ALJN
                  </div>
                </Link>
                <Link
                  href="/simulate"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => setSimDropdownOpen(false)}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderTop: '1px solid var(--color-border-default)',
                      marginTop: 4,
                      fontSize: '11px',
                      color: 'var(--color-accent-operational)',
                      fontWeight: 600,
                    }}
                  >
                    Open Full Simulator →
                  </div>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
