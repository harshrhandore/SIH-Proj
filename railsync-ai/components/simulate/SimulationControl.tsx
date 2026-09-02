'use client';

// =============================================================================
// SimulationControl — Top Control Strip for Disruption Injection
// =============================================================================

import { useSessionStore } from '@/store/sessionStore';
import { useOperationalStore } from '@/store/operationalStore';
import { useSimulation } from '@/hooks/useSimulation';
import { Zap, AlertTriangle, Play, RefreshCcw } from 'lucide-react';

export default function SimulationControl() {
  const user = useSessionStore((s) => s.user);
  const isSectionController = user?.role === 'ROLE_SC';
  const trains = useOperationalStore((s) => s.trains);

  const {
    selectedTrainNumber,
    delayMinutes,
    status,
    highImpactAlert,
    setSelectedTrain,
    setDelayMinutes,
    injectDelay,
    resetSimulation,
  } = useSimulation();

  const isRunning = status === 'running';

  // Group trains by priority
  const p1Trains = trains.filter((t) => t.priority === 1);
  const p2Trains = trains.filter((t) => t.priority === 2);
  const p3Trains = trains.filter((t) => t.priority === 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <div
        className="panel"
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-3)',
        }}
      >
        {/* Train Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            DISRUPTED TRAIN:
          </label>
          <select
            id="simulation-train-select"
            value={selectedTrainNumber || ''}
            onChange={(e) => setSelectedTrain(e.target.value || null)}
            disabled={isRunning}
            style={{
              padding: '6px 12px',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-data)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-interface)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Select Train to Delay --</option>
            <optgroup label="Priority 1: Rajdhani / Shatabdi / Vande Bharat">
              {p1Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} - {t.trainName}
                </option>
              ))}
            </optgroup>
            <optgroup label="Priority 2: Mail / Express">
              {p2Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} - {t.trainName}
                </option>
              ))}
            </optgroup>
            <optgroup label="Priority 3: Freight / ECS">
              {p3Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} - {t.trainName}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Delay Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            DELAY MAGNITUDE:
          </label>
          <input
            type="range"
            min={5}
            max={90}
            step={5}
            value={delayMinutes}
            disabled={isRunning}
            onChange={(e) => setDelayMinutes(Number(e.target.value))}
            style={{ width: 140, cursor: 'pointer' }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: delayMinutes > 60 ? 'var(--color-accent-critical)' : 'var(--color-accent-warning)',
              minWidth: 55,
            }}
          >
            +{delayMinutes} min
          </span>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          {isSectionController ? (
            <button
              id="inject-delay-action-btn"
              onClick={injectDelay}
              disabled={!selectedTrainNumber || isRunning}
              className="btn btn--primary"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <Zap size={14} />
              {isRunning ? 'Optimizing CP-SAT...' : 'Inject Delay & Re-Optimize'}
            </button>
          ) : (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                padding: '6px 12px',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-data)',
              }}
            >
              Role: {user?.role.replace('ROLE_', '')} (View Only — Section Controller required to re-optimize)
            </span>
          )}

          {status === 'complete' && (
            <button
              onClick={resetSimulation}
              className="btn btn--secondary"
              style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}
              title="Reset Simulation"
            >
              <RefreshCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* High-Impact Alert (>60 min delay threshold) */}
      {highImpactAlert && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            background: 'rgba(218, 54, 51, 0.12)',
            border: '1px solid var(--color-accent-critical)',
            borderRadius: 'var(--radius-panel)',
            color: 'var(--color-accent-critical)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={16} />
          <span>
            ⚠ High-impact delay (&gt;60 min): Severe cascading congestion detected. Manual Section Controller intervention and joint block re-authorization mandatory.
          </span>
        </div>
      )}
    </div>
  );
}
