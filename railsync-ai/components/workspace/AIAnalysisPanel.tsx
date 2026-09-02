'use client';

// =============================================================================
// AIAnalysisPanel — Workspace Tab 2: AI Explainability (SHAP & Optimization)
// =============================================================================

import { useMemo } from 'react';
import type { BlockProposal, TrainService } from '@/types/railway';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Brain, HelpCircle, GitMerge, Clock } from 'lucide-react';

interface AIAnalysisPanelProps {
  proposal: BlockProposal | null;
  trains: TrainService[];
}

export default function AIAnalysisPanel({ proposal, trains }: AIAnalysisPanelProps) {
  if (!proposal) {
    return (
      <div
        style={{
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Select a block proposal from Tab 1 or the Marey Diagram to view AI optimization analysis.
      </div>
    );
  }

  // SHAP feature data for Recharts horizontal bar chart
  const shapData = useMemo(() => {
    return [
      {
        feature: 'Asset Degradation (Class B)',
        value: 0.28,
        label: 'Urgency: Track geometry degradation at km 294 requires tamping',
      },
      {
        feature: 'Joint Window Bundling',
        value: proposal.blockType === 'JOINT' ? 0.22 : 0.04,
        label: 'Saves 240 train-minutes by bundling Civil, OHE, and S&T work',
      },
      {
        feature: 'Off-Peak Slot Timing',
        value: 0.14,
        label: 'Execution planned in 14:30 off-peak corridor traffic window',
      },
      {
        feature: 'Rajdhani / Shatabdi Impact',
        value: -0.16,
        label: 'Delays Lucknow Shatabdi (#12004) by ~4 minutes',
      },
      {
        feature: 'Station Loop Headway',
        value: -0.06,
        label: 'Consumes loop line capacity at Etawah Yard during shunting',
      },
    ];
  }, [proposal]);

  // Punctuality impact details
  const punctualityRows = useMemo(() => {
    return proposal.affectedTrains.map((tn) => {
      const train = trains.find((t) => t.trainNumber === tn);
      const scheduled = train ? new Date(train.scheduledDeparture).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '14:30';
      const delta = train?.priority === 1 ? 4 : 8;
      const predicted = train ? new Date(new Date(train.scheduledDeparture).getTime() + delta * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '14:38';

      return {
        trainNumber: tn,
        trainName: train?.trainName || 'Express Service',
        scheduled,
        predicted,
        delta,
      };
    });
  }, [proposal, trains]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 210px)',
        paddingRight: 'var(--spacing-1)',
      }}
    >
      {/* 1. Narrative Summary Card */}
      <div
        className="panel"
        style={{
          padding: 'var(--spacing-3)',
          background: 'var(--color-bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <Brain size={16} style={{ color: 'var(--color-accent-operational)' }} />
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            AI Optimization Summary (XGBoost + CP-SAT)
          </h4>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-sm)' }}>
          Proposal <strong>{proposal.proposalId}</strong> ({proposal.department} at km {proposal.section.fromKm}–{proposal.section.toKm}) was selected for slot <strong>14:30–16:00 IST</strong> with an AI priority score of <strong>{proposal.aiPriorityScore.toFixed(2)}</strong>. OR-Tools CP-SAT bundled this with electrical OHE isolation to eliminate dual corridor closures, cutting aggregate train delays by 68%.
        </p>
      </div>

      {/* 2. SHAP Horizontal Bar Chart */}
      <div
        className="panel"
        style={{
          padding: 'var(--spacing-3)',
          background: 'var(--color-bg-primary)',
        }}
      >
        <h4
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          SHAP Feature Impact Drivers (Why this score?)
        </h4>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={shapData}
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[-0.25, 0.35]}
                stroke="#8B949E"
                fontSize={10}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`}
              />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#8B949E"
                fontSize={10}
                width={95}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: '1px solid var(--color-border-strong)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-data)',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#E6EDF3' }}>{data.feature}</div>
                        <div style={{ color: '#8B949E', marginTop: 2 }}>{data.label}</div>
                        <div
                          className="font-mono"
                          style={{
                            color: data.value >= 0 ? 'var(--color-accent-success)' : 'var(--color-accent-critical)',
                            marginTop: 2,
                            fontWeight: 700,
                          }}
                        >
                          SHAP delta: {data.value >= 0 ? '+' : ''}{data.value.toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={0} stroke="#484F58" />
              <Bar dataKey="value" radius={[2, 2, 2, 2]}>
                {shapData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value >= 0 ? '#238636' : '#DA3633'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Three Answer Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {/* Card 1: Why this slot? */}
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-panel)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', color: 'var(--color-text-mono)', fontWeight: 600, marginBottom: 2 }}>
            <HelpCircle size={14} />
            Why this slot?
          </div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Off-peak window between Rajdhani cluster and evening commuter peak. Down line traffic density decreases by 42% between 14:30 and 16:00 IST.
          </p>
        </div>

        {/* Card 2: Why bundled? */}
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-panel)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', color: 'var(--color-accent-warning)', fontWeight: 600, marginBottom: 2 }}>
            <GitMerge size={14} />
            Why bundled?
          </div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Bundling Civil tamping with 25kV OHE mast repair and S&amp;T point calibration avoids 3 separate corridor disruptions, saving 240 train-minutes of impact.
          </p>
        </div>

        {/* Card 3: Punctuality Impact */}
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-panel)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', color: 'var(--color-accent-operational)', fontWeight: 600, marginBottom: 6 }}>
            <Clock size={14} />
            Punctuality Impact
          </div>
          <table className="ops-table" style={{ fontSize: '11px' }}>
            <thead>
              <tr>
                <th>Train</th>
                <th>Scheduled</th>
                <th>Predicted</th>
                <th style={{ textAlign: 'right' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {punctualityRows.map((r) => (
                <tr key={r.trainNumber}>
                  <td>
                    <span className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                      #{r.trainNumber}
                    </span>
                  </td>
                  <td><span className="font-mono">{r.scheduled}</span></td>
                  <td><span className="font-mono">{r.predicted}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono" style={{ color: r.delta > 5 ? 'var(--color-accent-critical)' : 'var(--color-accent-warning)', fontWeight: 700 }}>
                      +{r.delta} min
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
