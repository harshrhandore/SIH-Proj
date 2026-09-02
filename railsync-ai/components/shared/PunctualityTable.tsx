'use client';

// =============================================================================
// PunctualityTable — Impact table for affected train services
// =============================================================================

import type { PunctualityImpact } from '@/types/railway';

interface PunctualityTableProps {
  impacts: PunctualityImpact[];
}

export default function PunctualityTable({ impacts }: PunctualityTableProps) {
  if (!impacts || impacts.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--spacing-3)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-xs)',
          fontStyle: 'italic',
        }}
      >
        No train services negatively impacted by this block proposal.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ops-table" style={{ fontSize: 'var(--text-xs)' }}>
        <thead>
          <tr>
            <th>Train #</th>
            <th>Service Name</th>
            <th>Priority</th>
            <th style={{ textAlign: 'right' }}>Delay Delta</th>
          </tr>
        </thead>
        <tbody>
          {impacts.map((imp) => {
            const isHighDelay = imp.deltaMinutes > 5;
            const priorityColor =
              imp.priority === 1
                ? 'var(--color-accent-operational)'
                : imp.priority === 2
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-accent-neutral)';

            return (
              <tr key={imp.trainNumber}>
                <td>
                  <span className="font-mono" style={{ color: 'var(--color-text-mono)', fontWeight: 600 }}>
                    #{imp.trainNumber}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-primary)' }}>{imp.trainName}</td>
                <td>
                  <span
                    className="font-mono"
                    style={{
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-data)',
                      background: `${priorityColor}20`,
                      color: priorityColor,
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    P{imp.priority}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span
                    className="font-mono"
                    style={{
                      color: isHighDelay
                        ? 'var(--color-accent-critical)'
                        : 'var(--color-accent-warning)',
                      fontWeight: 700,
                    }}
                  >
                    +{imp.deltaMinutes} min
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
