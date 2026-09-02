'use client';

// =============================================================================
// DigitalSignatureForm — 2-Step Confirmation & Digital Signature Form
// =============================================================================
// Step 1: Checkbox acknowledging G&SR checklist & AI analysis.
// Step 2: Employee ID + 6-digit PIN input + Approve / Reject CTAs.
// Rejection requires min 20-char sanitized comment.
// =============================================================================

import { useState } from 'react';
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
  const [pin, setPin] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [isRejectingMode, setIsRejectingMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isPinValid = /^\d{6}$/.test(pin);
  const sanitizedCommentResult = sanitizeRejectionComment(rejectComment);

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
        }}
      >
        <input
          type="checkbox"
          id="confirm-intent-checkbox"
          checked={intentConfirmed}
          onChange={(e) => setIntentConfirmed(e.target.checked)}
          style={{ marginTop: 2 }}
        />
        <span>
          <strong>Step 1 (Intent Confirmation):</strong> I confirm that I have reviewed the
          G&amp;SR compliance checklist, track occupancy, and AI punctuality impact analysis.
        </span>
      </label>

      {/* Step 2: Digital Signature & Action (renders only after Step 1 is confirmed) */}
      {intentConfirmed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 4,
                }}
              >
                Employee ID
              </label>
              <input
                type="text"
                readOnly
                value={user?.employeeId || 'SC-4521'}
                className="font-mono"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  background: 'var(--color-bg-hover)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  color: 'var(--color-text-mono)',
                  fontSize: 'var(--text-xs)',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 4,
                }}
              >
                PIN / OTP (6 digits)
              </label>
              <input
                type="password"
                maxLength={6}
                id="digital-signature-pin"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="font-mono"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.2em',
                }}
              />
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
                }}
              >
                Mandatory Rejection Comment (min 20 characters):
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Specify operational ground for rejection (e.g. Overlapping mail train passover window at km 290)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xs)',
                  resize: 'vertical',
                }}
              />
              <div
                style={{
                  fontSize: '10px',
                  color:
                    sanitizedCommentResult.isValid
                      ? 'var(--color-accent-success)'
                      : 'var(--color-text-secondary)',
                  marginTop: 2,
                }}
              >
                Length: {sanitizedCommentResult.sanitized.length}/20 min chars
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: 'var(--spacing-2)',
                background: 'rgba(218, 54, 51, 0.1)',
                border: '1px solid var(--color-accent-critical)',
                borderRadius: 'var(--radius-data)',
                color: 'var(--color-accent-critical)',
                fontSize: 'var(--text-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            {!isRejectingMode ? (
              <>
                <button
                  type="button"
                  id="approve-memo-btn"
                  className="btn btn--primary"
                  disabled={!isPinValid || isBlockedByGSR || isSubmitting}
                  onClick={handleApproveClick}
                  style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                >
                  <Check size={14} />
                  {isSubmitting ? 'Authorizing...' : '✓ Approve Block Memo'}
                </button>

                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setIsRejectingMode(true)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  <X size={14} />
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="confirm-reject-btn"
                  className="btn btn--danger"
                  disabled={!isPinValid || !sanitizedCommentResult.isValid || isSubmitting}
                  onClick={handleRejectClick}
                  style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                >
                  <X size={14} />
                  {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                </button>

                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsRejectingMode(false)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Back
                </button>
              </>
            )}
          </div>

          {isBlockedByGSR && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-accent-critical)',
                textAlign: 'center',
              }}
            >
              Approval blocked: G&amp;SR violation. Contact Sr. DOM.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
