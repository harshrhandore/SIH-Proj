'use client';

// =============================================================================
// PrimaryActionBar — Full-width action bar below anchors
// =============================================================================
// SC role: "Launch AI Optimizer" + "Inject Delay" dropdown
// Other roles: "Submit New Block Request"
// =============================================================================

import { useSessionStore } from '@/store/sessionStore';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionAction } from '@/types/permissions';
import { Zap, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PrimaryActionBar() {
  const user = useSessionStore((s) => s.user);
  const { allowed: canLaunchOptimizer } = usePermissions(PermissionAction.LAUNCH_AI_OPTIMIZER);
  const { allowed: canSubmitRequest } = usePermissions(PermissionAction.SUBMIT_BLOCK_REQUEST);
  const { allowed: canTriggerSim } = usePermissions(PermissionAction.TRIGGER_SIMULATION);
  const [simDropdownOpen, setSimDropdownOpen] = useState(false);

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
        height: 52,
      }}
    >
      {/* Left: Primary CTA */}
      {canLaunchOptimizer ? (
        <Link href="/workspace" style={{ textDecoration: 'none' }}>
          <button className="btn btn--primary" id="launch-optimizer-btn">
            <Zap size={16} />
            Launch AI Optimizer — Review Pending Joint Windows
          </button>
        </Link>
      ) : canSubmitRequest ? (
        <button className="btn btn--primary" id="submit-request-btn">
          <Plus size={16} />
          Submit New Block Request
        </button>
      ) : (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          No primary actions available for current role.
        </span>
      )}

      {/* Right: Simulation trigger */}
      <div style={{ position: 'relative' }}>
        {canTriggerSim ? (
          <>
            <button
              className="btn btn--secondary"
              onClick={() => setSimDropdownOpen(!simDropdownOpen)}
              id="inject-delay-btn"
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
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--spacing-1)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-panel)',
                  boxShadow: 'var(--shadow-default)',
                  zIndex: 20,
                  overflow: 'hidden',
                  width: 220,
                }}
              >
                <Link
                  href="/simulate"
                  style={{
                    display: 'block',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                  }}
                  onClick={() => setSimDropdownOpen(false)}
                >
                  <Zap size={14} style={{ marginRight: 'var(--spacing-2)', verticalAlign: 'middle' }} />
                  Open Disruption Simulator
                </Link>
              </div>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
            Simulation: View Only
          </span>
        )}
      </div>
    </div>
  );
}
