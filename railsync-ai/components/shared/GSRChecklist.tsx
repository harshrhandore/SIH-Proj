'use client';

// =============================================================================
// GSRChecklist — Renders G&SR Rule Compliance Checklist
// =============================================================================
// Displays PASS (green), WARN (yellow with expandable note), FAIL (red).
// If any check is FAIL, approval is blocked.
// =============================================================================

import { useState } from 'react';
import type { GSRComplianceCheck } from '@/types/railway';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface GSRChecklistProps {
  checks: GSRComplianceCheck[];
}

export default function GSRChecklist({ checks }: GSRChecklistProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (ruleId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const hasFailure = checks.some((c) => c.status === 'FAIL');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {checks.map((check) => {
        const isFail = check.status === 'FAIL';
        const isWarn = check.status === 'WARN';
        const isPass = check.status === 'PASS';

        const color = isFail
          ? 'var(--color-accent-critical)'
          : isWarn
            ? 'var(--color-accent-warning)'
            : 'var(--color-accent-success)';

        return (
          <div
            key={check.ruleId}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              background: 'var(--color-bg-primary)',
              border: `1px solid ${isFail ? 'var(--color-accent-critical)' : 'var(--color-border-default)'}`,
              borderRadius: 'var(--radius-data)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                {isPass && <CheckCircle2 size={14} style={{ color, flexShrink: 0 }} />}
                {isWarn && <AlertTriangle size={14} style={{ color, flexShrink: 0 }} />}
                {isFail && <XCircle size={14} style={{ color, flexShrink: 0 }} />}

                <div>
                  <span className="font-mono" style={{ fontWeight: 700, color, marginRight: 6 }}>
                    {check.ruleId}
                  </span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{check.description}</span>
                </div>
              </div>

              {check.notes && (
                <button
                  type="button"
                  onClick={() => toggleNote(check.ruleId)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                  title="Toggle notes"
                >
                  {expandedNotes[check.ruleId] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>

            {/* Expandable note or always visible if FAIL */}
            {(isFail || expandedNotes[check.ruleId]) && check.notes && (
              <div
                style={{
                  marginTop: 'var(--spacing-2)',
                  paddingTop: 'var(--spacing-1)',
                  borderTop: '1px dashed var(--color-border-default)',
                  color: isFail ? 'var(--color-accent-critical)' : 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                }}
              >
                {check.notes}
              </div>
            )}
          </div>
        );
      })}

      {hasFailure && (
        <div
          style={{
            marginTop: 'var(--spacing-1)',
            padding: 'var(--spacing-2)',
            background: 'rgba(218, 54, 51, 0.12)',
            border: '1px solid var(--color-accent-critical)',
            borderRadius: 'var(--radius-data)',
            color: 'var(--color-accent-critical)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}
        >
          Approval blocked: G&amp;SR violation detected. Contact Sr. DOM.
        </div>
      )}
    </div>
  );
}
