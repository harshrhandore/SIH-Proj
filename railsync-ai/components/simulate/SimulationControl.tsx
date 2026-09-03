'use client';

// =============================================================================
// SimulationControl — Responsive Top Control Strip for Disruption Injection
// =============================================================================
// Touch & Mobile Compliance:
// - Custom 28×28px slider thumb with 15-min interval tick marks
// - Real-time floating callout bubble above thumb during drag
// - Confirmation badge on release
// - Full-width stacked controls on phone (48px dropdown, 52px CTA)
// =============================================================================

import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useOperationalStore } from '@/store/operationalStore';
import { useSimulation } from '@/hooks/useSimulation';
import { useNavMode } from '@/hooks/useNavMode';
import { Zap, AlertTriangle, Play, RefreshCcw, Sliders } from 'lucide-react';

export default function SimulationControl() {
  const user = useSessionStore((s) => s.user);
  const isSectionController = user?.role === 'ROLE_SC';
  const trains = useOperationalStore((s) => s.trains);
  const navMode = useNavMode();

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

  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isRunning = status === 'running';
  const isMobile = navMode === 'mobile';

  // Group trains by priority
  const p1Trains = trains.filter((t) => t.priority === 1);
  const p2Trains = trains.filter((t) => t.priority === 2);
  const p3Trains = trains.filter((t) => t.priority === 3);

  const handleSliderChange = (val: number) => {
    setDelayMinutes(val);
  };

  const handleSliderRelease = () => {
    setIsDragging(false);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <div
        className="panel"
        style={{
          padding: isMobile ? 'var(--spacing-3)' : 'var(--spacing-3) var(--spacing-4)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-3)',
        }}
      >
        {/* Train Selector */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 'var(--spacing-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            DISRUPTED TRAIN:
          </label>
          <select
            id="simulation-train-select"
            value={selectedTrainNumber || ''}
            onChange={(e) => setSelectedTrain(e.target.value || null)}
            disabled={isRunning || (!isSectionController && isMobile)}
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: 260,
              height: isMobile ? '48px' : '36px',
              padding: '6px 12px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-data)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Select Train to Delay --</option>
            <optgroup label="Priority 1 — Rajdhani / Shatabdi / Vande Bharat">
              {p1Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} {t.trainName} (Dep {t.scheduledDeparture.slice(11, 16)})
                </option>
              ))}
            </optgroup>
            <optgroup label="Priority 2 — Mail / Express">
              {p2Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} {t.trainName} (Dep {t.scheduledDeparture.slice(11, 16)})
                </option>
              ))}
            </optgroup>
            <optgroup label="Priority 3 / Engineering — Freight / Ballast">
              {p3Trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} {t.trainName} ({t.serviceType})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Delay Slider with 28px Thumb & 15-min Ticks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: isMobile ? 'none' : 1, maxWidth: isMobile ? '100%' : 380, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              INJECTED DELAY:
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: delayMinutes > 0 ? 'var(--color-accent-warning)' : 'var(--color-text-secondary)', fontSize: '13px' }}>
              +{delayMinutes} min
            </span>
          </div>

          {/* Floating Bubble Callout on Drag */}
          {isDragging && (
            <div
              style={{
                position: 'absolute',
                top: -24,
                left: `calc(${(delayMinutes / 120) * 100}% - 24px)`,
                background: 'var(--color-accent-operational)',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: 'var(--radius-data)',
                fontSize: '11px',
                fontWeight: 700,
                pointerEvents: 'none',
              }}
            >
              +{delayMinutes}m
            </div>
          )}

          <input
            type="range"
            min={0}
            max={120}
            step={5}
            value={delayMinutes}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={handleSliderRelease}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            disabled={isRunning || (!isSectionController && isMobile)}
            style={{
              width: '100%',
              accentColor: 'var(--color-accent-operational)',
              cursor: 'pointer',
              height: '28px',
            }}
          />

          {/* 15-Minute Interval Tick Marks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-secondary)', padding: '0 4px' }}>
            <span>0m</span>
            <span>15m</span>
            <span>30m</span>
            <span>45m</span>
            <span>60m</span>
            <span>75m</span>
            <span>90m</span>
            <span>105m</span>
            <span>120m</span>
          </div>

          {showConfirm && (
            <div style={{ fontSize: '10px', color: 'var(--color-accent-success)', fontWeight: 600, textAlign: 'center', marginTop: 2 }}>
              ✓ {delayMinutes} min delay selected
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', width: isMobile ? '100%' : 'auto' }}>
          <button
            onClick={() => injectDelay()}
            disabled={!selectedTrainNumber || delayMinutes === 0 || isRunning || (!isSectionController && isMobile)}
            className="btn btn--primary"
            id="run-simulation-btn"
            style={{
              flex: isMobile ? 1 : 'none',
              height: isMobile ? '52px' : '38px',
              justifyContent: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              opacity: !selectedTrainNumber || delayMinutes === 0 ? 0.5 : 1,
            }}
          >
            <Play size={16} />
            <span>{isRunning ? 'Optimizing...' : 'Inject Delay'}</span>
          </button>

          <button
            onClick={resetSimulation}
            disabled={status === 'idle' && delayMinutes === 0 && !selectedTrainNumber}
            className="btn btn--secondary"
            id="reset-simulation-btn"
            style={{
              height: isMobile ? '52px' : '38px',
              padding: isMobile ? '0 16px' : '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Reset Disruption Scenario"
          >
            <RefreshCcw size={14} />
            {isMobile && <span>Reset</span>}
          </button>
        </div>
      </div>

      {/* High-Impact Alert Banner */}
      {highImpactAlert && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-accent-critical)',
            borderRadius: 'var(--radius-panel)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            color: 'var(--color-accent-critical)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>High Operational Impact Detected:</strong> Injected disruption forces rescheduling of
            active joint block windows. Review the OR-Tools CP-SAT conflict resolution narrative below.
          </div>
        </div>
      )}
    </div>
  );
}
