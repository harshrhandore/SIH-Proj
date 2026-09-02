'use client';

// =============================================================================
// ShapExplanationCard — AI Explainability Card (SHAP)
// =============================================================================

import type { ShapExplanation } from '@/types/railway';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

interface ShapExplanationCardProps {
  explanation: ShapExplanation;
  showFullLink?: boolean;
  maxFeatures?: number;
}

export default function ShapExplanationCard({
  explanation,
  showFullLink = true,
  maxFeatures = 3,
}: ShapExplanationCardProps) {
  const featuresToShow = explanation.topFeatures.slice(0, maxFeatures);

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-panel)',
        padding: 'var(--spacing-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <BrainCircuit size={16} style={{ color: 'var(--color-accent-operational)' }} />
          <span
            style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
            }}
          >
            AI Optimizer Reasoning (SHAP)
          </span>
        </div>

        <span
          className="font-mono"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color:
              explanation.finalScore >= 0.7
                ? 'var(--color-accent-success)'
                : 'var(--color-accent-warning)',
          }}
        >
          Score: {explanation.finalScore.toFixed(2)}
        </span>
      </div>

      {/* Narrative summary */}
      <p
        style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-sm)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        {explanation.narrativeSummary}
      </p>

      {/* Top feature contributions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {featuresToShow.map((feat) => {
          const isPositive = feat.shapValue >= 0;
          const barWidth = Math.min(100, Math.abs(feat.shapValue) * 250);

          return (
            <div key={feat.featureName} style={{ fontSize: 'var(--text-xs)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 2,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{feat.humanLabel}</span>
                <span
                  className="font-mono"
                  style={{
                    color: isPositive
                      ? 'var(--color-accent-success)'
                      : 'var(--color-accent-critical)',
                    fontWeight: 600,
                  }}
                >
                  {isPositive ? '+' : ''}
                  {feat.shapValue.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  width: '100%',
                  background: 'var(--color-bg-hover)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: isPositive
                      ? 'var(--color-accent-success)'
                      : 'var(--color-accent-critical)',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showFullLink && (
        <div style={{ marginTop: 'var(--spacing-3)', textAlign: 'right' }}>
          <Link
            href="/workspace"
            style={{
              color: 'var(--color-accent-operational)',
              fontSize: 'var(--text-xs)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            View Full Analysis in Workspace →
          </Link>
        </div>
      )}
    </div>
  );
}
