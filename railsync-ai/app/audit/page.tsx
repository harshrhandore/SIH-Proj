'use client';

// =============================================================================
// Audit & Security Log Page (/audit)
// =============================================================================
// Full-width audit log with cryptographic hash chain integrity banner,
// filters (role, action, search), CSV export, collapsible security sidebar,
// and tamper detection verification.
// =============================================================================

import { useState, useMemo, useEffect, Fragment } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { useSessionStore } from '@/store/sessionStore';
import { truncateHash, verifyChain } from '@/lib/utils/crypto';
import { exportAuditCSV } from '@/lib/mock-api/audit';
import type { AuditEntry, RoleCode, AuditAction } from '@/types/railway';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Shield,
  Clock,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

export default function AuditPage() {
  const entries = useAuditStore((s) => s.entries);
  const chainVerified = useAuditStore((s) => s.chainVerified);
  const verifiedCount = useAuditStore((s) => s.verifiedCount);
  const totalCount = useAuditStore((s) => s.totalCount);
  const verificationTimestamp = useAuditStore((s) => s.verificationTimestamp);
  const failureIndex = useAuditStore((s) => s.failureIndex);
  const verifyIntegrity = useAuditStore((s) => s.verifyIntegrity);
  const tamperDebugFlag = useAuditStore((s) => s.tamperDebugFlag);
  const setTamperDebugFlag = useAuditStore((s) => s.setTamperDebugFlag);

  const user = useSessionStore((s) => s.user);
  const getMinutesRemaining = useSessionStore((s) => s.getMinutesRemaining);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [securitySidebarOpen, setSecuritySidebarOpen] = useState(false);

  // Auto-verify chain on page mount
  useEffect(() => {
    verifyIntegrity();
  }, [verifyIntegrity]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (roleFilter !== 'ALL' && e.actorRole !== roleFilter) return false;
      if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = e.targetId.toLowerCase().includes(q);
        const matchesActor = e.actorId.toLowerCase().includes(q);
        const matchesAction = e.action.toLowerCase().includes(q);
        if (!matchesTarget && !matchesActor && !matchesAction) return false;
      }
      return true;
    });
  }, [entries, roleFilter, actionFilter, searchQuery]);

  const handleExportCSV = () => {
    const csvContent = exportAuditCSV(filteredEntries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RailSync_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedVerificationTime = verificationTimestamp
    ? new Date(verificationTimestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* 1. Integrity Banner (Always visible above table) */}
      <div
        className="panel"
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          background:
            chainVerified === true
              ? 'rgba(35, 134, 54, 0.12)'
              : chainVerified === false
                ? 'rgba(218, 54, 51, 0.15)'
                : 'var(--color-bg-elevated)',
          border: `1px solid ${
            chainVerified === true
              ? 'var(--color-accent-success)'
              : chainVerified === false
                ? 'var(--color-accent-critical)'
                : 'var(--color-border-default)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          {chainVerified === true ? (
            <ShieldCheck size={20} style={{ color: 'var(--color-accent-success)' }} />
          ) : chainVerified === false ? (
            <ShieldAlert size={20} style={{ color: 'var(--color-accent-critical)' }} />
          ) : (
            <Shield size={20} style={{ color: 'var(--color-text-secondary)' }} />
          )}

          <div>
            <div
              style={{
                fontFamily: 'var(--font-reading)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                color: chainVerified === false ? 'var(--color-accent-critical)' : 'var(--color-text-primary)',
              }}
            >
              {chainVerified === true ? (
                `✓ ${totalCount} entries — Chain integrity verified as of ${formattedVerificationTime} IST`
              ) : chainVerified === false ? (
                `⚠ Audit chain tampered at entry #${failureIndex}. Incident reported to CISO. Ref: IR-SEC-INC-9402`
              ) : (
                'Verifying cryptographic audit hash chain...'
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Algorithm: SHA-256 (Web Crypto API) | Recursive canonical dependency on predecessor hash
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          {/* Tamper test toggle for EC-06 */}
          <button
            onClick={() => {
              setTamperDebugFlag(!tamperDebugFlag);
              setTimeout(() => verifyIntegrity(), 100);
            }}
            className="btn btn--secondary"
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderColor: tamperDebugFlag ? 'var(--color-accent-critical)' : 'var(--color-border-default)',
            }}
            title="Inject deliberate tamper to test EC-06 error state"
          >
            {tamperDebugFlag ? 'Reset Tamper Simulation' : 'Test Tamper Detection (EC-06)'}
          </button>

          <button
            onClick={() => verifyIntegrity()}
            className="btn btn--primary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Re-verify Chain
          </button>
        </div>
      </div>

      {/* Main Content: Table + Collapsible Security Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: securitySidebarOpen ? '1fr 300px' : '1fr 40px', gap: 'var(--spacing-3)' }}>
        {/* Left Column: Filter Controls & Audit Log Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {/* Filter Bar */}
          <div
            className="panel"
            style={{
              padding: 'var(--spacing-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--spacing-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flex: 1 }}>
              {/* Search */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  padding: '4px 8px',
                  width: 220,
                }}
              >
                <Search size={14} style={{ color: 'var(--color-text-secondary)', marginRight: 6 }} />
                <input
                  type="text"
                  placeholder="Search ID, actor, action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-xs)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '5px 10px',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="ROLE_SC">Section Controller (SC)</option>
                <option value="ROLE_ENG">Engineering (ENG)</option>
                <option value="ROLE_TPC">Traction Power (TPC)</option>
                <option value="ROLE_ST">Signal &amp; Telecom (S&amp;T)</option>
              </select>

              {/* Action filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{
                  padding: '5px 10px',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-data)',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Actions</option>
                <option value="BLOCK_SUBMITTED">BLOCK_SUBMITTED</option>
                <option value="AI_RECOMMENDATION_GENERATED">AI_RECOMMENDATION</option>
                <option value="BLOCK_REVIEWED">BLOCK_REVIEWED</option>
                <option value="BLOCK_APPROVED">BLOCK_APPROVED</option>
                <option value="BLOCK_REJECTED">BLOCK_REJECTED</option>
                <option value="CAUTION_ORDER_ISSUED">CAUTION_ORDER</option>
              </select>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="btn btn--secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
              id="export-csv-btn"
            >
              <Download size={14} />
              Export CSV ({filteredEntries.length})
            </button>
          </div>

          {/* Audit Entries Table */}
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Entry #</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target ID</th>
                  <th>Delta Preview</th>
                  <th>Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isExpanded = expandedRowId === entry.entryId;
                  const time = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Kolkata',
                    hour12: false,
                  });

                  return (
                    <Fragment key={entry.entryId}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : entry.entryId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                            {time}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono">{entry.entryId}</span>
                        </td>
                        <td style={{ color: 'var(--color-text-primary)' }}>{entry.actorId}</td>
                        <td>
                          <span className="font-mono" style={{ fontSize: '10px' }}>
                            [{entry.actorRole.replace('ROLE_', '')}]
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{entry.action}</span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ color: 'var(--color-accent-operational)' }}>
                            {entry.targetId}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            {JSON.stringify(entry.delta)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ color: 'var(--color-text-mono)', fontWeight: 600 }}>
                            {truncateHash(entry.integrityHash)}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row: Full JSON & Cryptographic Proof */}
                      {isExpanded && (
                        <tr key={`${entry.entryId}-expanded`}>
                          <td colSpan={8} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  Full SHA-256 Hash: <strong className="font-mono" style={{ color: 'var(--color-text-mono)' }}>{entry.integrityHash}</strong>
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  Session ID: <strong className="font-mono">{entry.sessionId}</strong> | IP: <strong className="font-mono">{entry.ipAddress}</strong>
                                </span>
                              </div>
                              <pre
                                style={{
                                  background: 'var(--color-bg-elevated)',
                                  padding: 'var(--spacing-2)',
                                  borderRadius: 'var(--radius-data)',
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-interface)',
                                  color: '#A5D6FF',
                                  overflowX: 'auto',
                                }}
                              >
                                {JSON.stringify(entry.delta, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Collapsible Security Annotations Sidebar */}
        <div
          className="panel"
          style={{
            padding: securitySidebarOpen ? 'var(--spacing-3)' : 'var(--spacing-2)',
            background: 'var(--color-bg-elevated)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: securitySidebarOpen ? 'var(--spacing-3)' : 0,
            }}
            onClick={() => setSecuritySidebarOpen(!securitySidebarOpen)}
          >
            {securitySidebarOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                <Terminal size={14} style={{ color: 'var(--color-accent-operational)' }} />
                Security &amp; Compliance
              </div>
            ) : null}
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                margin: '0 auto',
              }}
              title="Toggle Security Sidebar"
            >
              {securitySidebarOpen ? <ChevronRight size={14} /> : <Shield size={16} />}
            </button>
          </div>

          {securitySidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--text-xs)' }}>
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>CERT-In Compliance Reference:</div>
                <div style={{ color: 'var(--color-text-primary)', marginTop: 2 }}>
                  IR Cyber Security Policy 2023 Section 4.2 (Tamper-evident operational audit logs)
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>SIEM Integration:</div>
                <div style={{ color: 'var(--color-text-primary)', marginTop: 2 }}>
                  Forwarding to mock SIEM endpoint (configured in .env.local: <code>SIEM_ENDPOINT</code>)
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Session Monitor:</div>
                <div style={{ color: 'var(--color-text-mono)', marginTop: 2 }}>
                  Expiry in: <strong>{getMinutesRemaining()} min</strong>
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', marginTop: 2 }}>
                  Auto-logout enforced at 0 min of inactivity.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
