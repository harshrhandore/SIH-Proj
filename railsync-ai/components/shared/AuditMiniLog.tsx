'use client';

// =============================================================================
// AuditMiniLog — Proposal Audit Trail & Chain Verification
// =============================================================================

import { useState } from 'react';
import type { AuditEntry } from '@/types/railway';
import { truncateHash, verifyChain } from '@/lib/utils/crypto';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface AuditMiniLogProps {
  entries: AuditEntry[];
}

export default function AuditMiniLog({ entries }: AuditMiniLogProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    tested: boolean;
    isValid: boolean;
    verifiedCount: number;
    totalCount: number;
    failureIndex: number | null;
  } | null>(null);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyChain(entries);
      setVerifyStatus({
        tested: true,
        isValid: res.isValid,
        verifiedCount: res.verifiedCount,
        totalCount: res.totalCount,
        failureIndex: res.failureIndex,
      });
    } catch {
      setVerifyStatus({
        tested: true,
        isValid: false,
        verifiedCount: 0,
        totalCount: entries.length,
        failureIndex: 0,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        padding: 'var(--spacing-3)',
        borderRadius: 'var(--radius-panel)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Shield size={14} style={{ color: 'var(--color-text-mono)' }} />
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
            }}
          >
            Tamper-Evident Audit Trail ({entries.length})
          </span>
        </div>

        <button
          type="button"
          onClick={handleVerifyChain}
          disabled={isVerifying || entries.length === 0}
          className="btn btn--secondary"
          style={{ padding: '3px 8px', fontSize: '10px' }}
        >
          <RefreshCw size={10} style={{ animation: isVerifying ? 'spin 1s linear infinite' : 'none' }} />
          Verify Chain
        </button>
      </div>

      {/* Verification status banner */}
      {verifyStatus?.tested && (
        <div
          style={{
            marginBottom: 'var(--spacing-3)',
            padding: 'var(--spacing-2)',
            borderRadius: 'var(--radius-data)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: verifyStatus.isValid ? 'rgba(35, 134, 54, 0.15)' : 'rgba(218, 54, 51, 0.15)',
            border: `1px solid ${verifyStatus.isValid ? 'var(--color-accent-success)' : 'var(--color-accent-critical)'}`,
            color: verifyStatus.isValid ? 'var(--color-accent-success)' : 'var(--color-accent-critical)',
          }}
        >
          {verifyStatus.isValid ? (
            <>
              <ShieldCheck size={14} />
              <span>
                ✓ Chain intact — {verifyStatus.verifiedCount}/{verifyStatus.totalCount} entries verified
              </span>
            </>
          ) : (
            <>
              <ShieldAlert size={14} />
              <span>
                ✗ Integrity failure at entry {verifyStatus.failureIndex} — ALERT
              </span>
            </>
          )}
        </div>
      )}

      {/* Entries timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {entries.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', fontStyle: 'italic' }}>
            No audit records for this proposal yet.
          </div>
        ) : (
          entries.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Kolkata',
              hour12: false,
            });

            return (
              <div
                key={item.entryId}
                style={{
                  fontSize: '11px',
                  padding: '4px 6px',
                  background: 'var(--color-bg-elevated)',
                  borderLeft: '2px solid var(--color-border-strong)',
                  borderRadius: '0 var(--radius-data) var(--radius-data) 0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span className="font-mono">{timeStr} IST</span>
                  <span className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                    Integrity: {truncateHash(item.integrityHash)}...
                  </span>
                </div>
                <div style={{ marginTop: 2, color: 'var(--color-text-primary)' }}>
                  <strong style={{ color: 'var(--color-accent-operational)' }}>
                    [{item.actorRole.replace('ROLE_', '')}]
                  </strong>{' '}
                  {item.action.replace(/_/g, ' ')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
