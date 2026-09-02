'use client';

// =============================================================================
// RecentActivity — Last 10 AuditEntry records as compact timeline
// =============================================================================
// Monospace timestamps and diff-like formatting.
// =============================================================================

import { useMemo } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { truncateHash } from '@/lib/utils/crypto';
import { ROLE_LABELS, type RoleCode } from '@/types/railway';

const ACTION_LABELS: Record<string, string> = {
  BLOCK_SUBMITTED: 'submitted block proposal',
  AI_RECOMMENDATION_GENERATED: 'AI generated recommendation',
  BLOCK_REVIEWED: 'reviewed block',
  BLOCK_APPROVED: 'approved block',
  BLOCK_REJECTED: 'rejected block',
  BLOCK_CANCELLED: 'cancelled block',
  BLOCK_ACTIVATED: 'activated block',
  BLOCK_COMPLETED: 'completed block',
  SIMULATION_RUN: 'ran disruption simulation',
  TSR_ISSUED: 'issued TSR',
  CAUTION_ORDER_ISSUED: 'issued caution order',
  OVERRIDE_REQUESTED: 'requested override',
  EMERGENCY_CANCELLATION: 'emergency cancellation',
};

const ACTION_COLORS: Record<string, string> = {
  BLOCK_SUBMITTED: 'var(--color-accent-operational)',
  AI_RECOMMENDATION_GENERATED: 'var(--color-text-mono)',
  BLOCK_REVIEWED: 'var(--color-accent-warning)',
  BLOCK_APPROVED: 'var(--color-accent-success)',
  BLOCK_REJECTED: 'var(--color-accent-critical)',
  CAUTION_ORDER_ISSUED: 'var(--color-accent-warning)',
};

export default function RecentActivity() {
  const entries = useAuditStore((s) => s.entries);
  const recentEntries = useMemo(
    () => entries.slice(-10).reverse(),
    [entries]
  );

  if (recentEntries.length === 0) {
    return (
      <div style={{
        padding: 'var(--spacing-6)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)',
      }}>
        No recent activity.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {recentEntries.map((entry, idx) => {
        const time = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata',
          hour12: false,
        });

        const actionColor = ACTION_COLORS[entry.action] || 'var(--color-text-secondary)';
        const actionLabel = ACTION_LABELS[entry.action] || entry.action.toLowerCase().replace(/_/g, ' ');
        const roleName = ROLE_LABELS[entry.actorRole as RoleCode] || entry.actorRole;

        // Format delta preview
        const deltaPreview = (() => {
          const d = entry.delta;
          if (d.status && typeof d.status === 'object') {
            const s = d.status as { before: string; after: string };
            return `${s.before || '∅'} → ${s.after}`;
          }
          const keys = Object.keys(d).slice(0, 2);
          return keys.map((k) => `${k}: ${String(d[k]).substring(0, 30)}`).join(', ');
        })();

        return (
          <div
            key={entry.entryId}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-2) var(--spacing-3)',
              borderBottom: idx < recentEntries.length - 1
                ? '1px solid var(--color-border-default)'
                : 'none',
              fontSize: 'var(--text-sm)',
            }}
          >
            {/* Timestamp */}
            <span
              className="font-mono"
              style={{
                color: 'var(--color-text-mono)',
                fontSize: 'var(--text-xs)',
                flexShrink: 0,
                minWidth: 70,
              }}
            >
              {time}
            </span>

            {/* Role tag */}
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
                minWidth: 40,
                fontWeight: 500,
              }}
            >
              [{entry.actorRole.replace('ROLE_', '')}]
            </span>

            {/* Action */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: actionColor, fontWeight: 500 }}>
                {actionLabel}
              </span>
              <span style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>—</span>
              <span
                className="font-mono"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {deltaPreview}
              </span>
            </div>

            {/* Hash */}
            <span
              className="font-mono"
              style={{
                color: 'var(--color-accent-neutral)',
                fontSize: 'var(--text-xs)',
                flexShrink: 0,
              }}
            >
              {truncateHash(entry.integrityHash)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
