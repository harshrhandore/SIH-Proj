'use client';

// =============================================================================
// DigitalSignatureForm — 2-Step Confirmation & Digital Signature Form
// =============================================================================
// Mobile & Workstation Operational Compliance:
// - 6 individual auto-advancing numeric PIN boxes (inputMode="tel", 48×56px touch target)
// - Auto-focus progression from box 1 to 6 and backspace reverse navigation
// - Stacked 52px high-consequence CTAs (Approve on top, Reject #DA3633 outline below)
// - Minimum 16px separation between destructive and grant actions
// - Mandatory sanitized rejection commentary (>20 chars)
// =============================================================================

import { useState, useRef } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { sanitizeRejectionComment } from '@/lib/utils/sanitize';
import { Check, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface DigitalSignatureFormProps {
  proposalId: string;
  isBlockedByGSR: boolean;
  onApprove: (employeeId: string, pin: string) => Promise<void>;
  onReject: (employeeId: string, pin: string, comment: string) => Promise<void>;
}

export default function DigitalSignatureForm({
  proposalId,
  isBlockedByGSR,
  onApprove,
  onReject,
}: DigitalSignatureFormProps) {
  const user = useSessionStore((s) => s.user);
  const isSectionController = user?.role === 'ROLE_SC';

  const [intentConfirmed, setIntentConfirmed] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [rejectComment, setRejectComment] = useState('');
  const [isRejectingMode, setIsRejectingMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isSectionController) {
    return (
      <div
        style={{
          padding: 'var(--spacing-3)',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-data)',
          border: '1px solid var(--color-border-default)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-xs)',
          fontStyle: 'italic',
        }}
      >
        Awaiting Section Controller review and digital signature.
      </div>
    );
  }

  const pin = pinDigits.join('');
  const isPinValid = /^\d{6}$/.test(pin);
  const sanitizedCommentResult = sanitizeRejectionComment(rejectComment);

  // Handle PIN box change & auto-advance
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...pinDigits];
      next[index] = '';
      setPinDigits(next);
      return;
    }

    // Single digit entry
    const char = cleaned.slice(-1);
    const next = [...pinDigits];
    next[index] = char;
    setPinDigits(next);

    // Auto-advance to next box if not on last
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setPinDigits(next);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleApproveClick = async () => {
    if (isBlockedByGSR) {
      setErrorMsg('Approval blocked by G&SR rule failure.');
      return;
    }
    if (!isPinValid) {
      setErrorMsg('Please enter a valid 6-digit PIN / OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onApprove(user?.employeeId || 'SC-4521', pin);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!isPinValid) {
      setErrorMsg('Please enter a valid 6-digit PIN / OTP.');
      return;
    }
    if (!sanitizedCommentResult.isValid) {
      setErrorMsg('Rejection requires a mandatory comment of at least 20 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onReject(
        user?.employeeId || 'SC-4521',
        pin,
        sanitizedCommentResult.sanitized
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)',
        background: 'var(--color-bg-primary)',
        padding: 'var(--spacing-3)',
        borderRadius: 'var(--radius-panel)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <ShieldCheck size={16} style={{ color: 'var(--color-accent-operational)' }} />
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
          }}
        >
          Section Controller Digital Authorization
        </span>
      </div>

      {/* Step 1: Confirm Intent */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--spacing-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          padding: 'var(--spacing-2)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-data)',
          border: intentConfirmed
            ? '1px solid var(--color-accent-operational)'
            : '1px solid var(--color-border-default)',
          minHeight: '44px',
        }}
      >
        <input
          type="checkbox"
          id="confirm-intent-checkbox"
          checked={intentConfirmed}
          onChange={(e) => setIntentConfirmed(e.target.checked)}
          style={{ marginTop: 3, width: 18, height: 18 }}
        />
        <span>
          <strong>Step 1 (Intent Confirmation):</strong> I confirm that I have reviewed the
          G&amp;SR compliance checklist, track occupancy, and AI punctuality impact analysis.
        </span>
      </label>

      {/* Step 2: Digital Signature & Action */}
      {intentConfirmed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {/* Employee ID Readout */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: 4,
              }}
            >
              Signatory Controller ID
            </label>
            <input
              type="text"
              readOnly
              value={`${user?.name} (${user?.employeeId || 'SC-4521'})`}
              className="font-mono"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--color-bg-hover)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-data)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            />
          </div>

          {/* 6-Digit Individual PIN Input Boxes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Authorization PIN / OTP (6 Digits):
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'space-between',
              }}
              onPaste={handlePaste}
            >
              {pinDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`PIN Digit ${i + 1}`}
                  className="font-mono"
                  style={{
                    flex: 1,
                    maxWidth: '48px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-panel)',
                    border: digit
                      ? '2px solid var(--color-accent-operational)'
                      : '1px solid var(--color-border-strong)',
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Rejection comment field */}
          {isRejectingMode && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-accent-critical)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Mandatory Rejection Operational Ground (min 20 characters):
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Specify operational ground for rejection (e.g. Overlapping mail train passover window at km 290)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-panel)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xs)',
                  resize: 'vertical',
                }}
              />
              <div
                style={{
                  fontSize: '10px',
                  color: sanitizedCommentResult.isValid
                    ? 'var(--color-accent-success)'
                    : 'var(--color-accent-critical)',
                  marginTop: 2,
                }}
              >
                {rejectComment.length}/20 characters required
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-accent-critical)',
                borderRadius: 'var(--radius-data)',
                color: 'var(--color-accent-critical)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action CTAs (Stacked vertically with minimum 16px gap on destructive) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 4 }}>
            {!isRejectingMode ? (
              <>
                <button
                  type="button"
                  id="drawer-approve-btn"
                  onClick={handleApproveClick}
                  disabled={isSubmitting || isBlockedByGSR}
                  className="btn btn--primary"
                  style={{
                    width: '100%',
                    height: '52px',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    opacity: isBlockedByGSR ? 0.5 : 1,
                  }}
                >
                  <Check size={18} />
                  <span>{isSubmitting ? 'Granting Block...' : 'Approve & Grant Block Window'}</span>
                </button>

                <button
                  type="button"
                  data-action-type="destructive"
                  onClick={() => setIsRejectingMode(true)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: 'var(--radius-panel)',
                    border: '1.5px solid #DA3633',
                    background: 'transparent',
                    color: '#DA3633',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <X size={18} />
                  <span>Reject Block Proposal...</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  data-action-type="destructive"
                  onClick={handleRejectClick}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: 'var(--radius-panel)',
                    border: 'none',
                    background: '#DA3633',
                    color: '#FFFFFF',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <X size={18} />
                  <span>{isSubmitting ? 'Rejecting...' : 'Confirm Formal Block Rejection'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRejectingMode(false)}
                  className="btn btn--secondary"
                  style={{ width: '100%', height: '48px', justifyContent: 'center' }}
                >
                  Cancel Rejection
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
