'use client';

// =============================================================================
// Audit & Security Log Page (/audit)
// =============================================================================
// Responsive adaptations:
// - PHONE: Sticky integrity banner, full-width "⬇ Export CSV" button, horizontal
//          scroll filter strip, and full card-stack layout with expandable JSON deltas.
// - TABLET: 4-column table with horizontal scroll for expanded delta view.
// - DESKTOP: Multi-column table with collapsible security sidebar.
// =============================================================================

import { useState, useMemo, useEffect, Fragment } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { useSessionStore } from '@/store/sessionStore';
import { useNavMode } from '@/hooks/useNavMode';
import { truncateHash } from '@/lib/utils/crypto';
import { exportAuditCSV } from '@/lib/mock-api/audit';
import type { RoleCode, AuditAction } from '@/types/railway';
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
  const totalCount = useAuditStore((s) => s.totalCount);
  const verificationTimestamp = useAuditStore((s) => s.verificationTimestamp);
  const failureIndex = useAuditStore((s) => s.failureIndex);
  const verifyIntegrity = useAuditStore((s) => s.verifyIntegrity);
  const tamperDebugFlag = useAuditStore((s) => s.tamperDebugFlag);
  const setTamperDebugFlag = useAuditStore((s) => s.setTamperDebugFlag);

  const user = useSessionStore((s) => s.user);
  const navMode = useNavMode();

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

  const toggleExpand = (entryId: string) => {
    setExpandedRowId(expandedRowId === entryId ? null : entryId);
  };

  const formattedVerificationTime = verificationTimestamp
    ? new Date(verificationTimestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    : '--:--:--';

  const isMobile = navMode === 'mobile';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* Cryptographic Hash Chain Integrity Banner */}
      <div
        className="panel"
        style={{
          position: isMobile ? 'sticky' : 'static',
          top: isMobile ? 0 : 'auto',
          zIndex: isMobile ? 10 : 1,
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
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          {chainVerified === true ? (
            <ShieldCheck size={20} style={{ color: 'var(--color-accent-success)', flexShrink: 0 }} />
          ) : chainVerified === false ? (
            <ShieldAlert size={20} style={{ color: 'var(--color-accent-critical)', flexShrink: 0 }} />
          ) : (
            <Shield size={20} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
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
                `✓ ${totalCount} entries — Chain verified as of ${formattedVerificationTime} IST`
              ) : chainVerified === false ? (
                `⚠ Chain tampered at #${failureIndex}. Incident reported to CISO. Ref: IR-SEC-INC-9402`
              ) : (
                'Verifying cryptographic audit hash chain...'
              )}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              SHA-256 (Web Crypto API) | Recursive canonical dependency
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', width: isMobile ? '100%' : 'auto' }}>
          <button
            onClick={() => {
              setTamperDebugFlag(!tamperDebugFlag);
              setTimeout(() => verifyIntegrity(), 100);
            }}
            className="btn btn--secondary"
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              flex: isMobile ? 1 : 'none',
              borderColor: tamperDebugFlag ? 'var(--color-accent-critical)' : 'var(--color-border-default)',
            }}
            title="Inject deliberate tamper to test EC-06 error state"
          >
            {tamperDebugFlag ? 'Reset Tamper' : 'Test Tamper (EC-06)'}
          </button>

          <button
            onClick={() => verifyIntegrity()}
            className="btn btn--primary"
            style={{ padding: '4px 10px', fontSize: '11px', flex: isMobile ? 1 : 'none' }}
          >
            Re-verify
          </button>
        </div>
      </div>

      {/* PHONE EXPORT BUTTON: Full-width above filters */}
      {isMobile && (
        <button
          onClick={handleExportCSV}
          className="btn btn--secondary"
          style={{
            width: '100%',
            height: '48px',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
          }}
        >
          <span>⬇ Export CSV ({filteredEntries.length} Records)</span>
        </button>
      )}

      {/* Filter Bar */}
      <div
        className="panel"
        style={{
          padding: 'var(--spacing-3)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-2)',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-data)',
            padding: '6px 10px',
            width: isMobile ? '100%' : 240,
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

        {/* Filter Selectors (Horizontal scroll strip on mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-data)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              minWidth: 120,
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ROLE_SC">Section Controller</option>
            <option value="ROLE_ENG">Engineering</option>
            <option value="ROLE_TPC">Electrical (TPC)</option>
            <option value="ROLE_ST">S&amp;T</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-data)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              minWidth: 140,
            }}
          >
            <option value="ALL">All Actions</option>
            <option value="BLOCK_GRANTED">BLOCK_GRANTED</option>
            <option value="BLOCK_REJECTED">BLOCK_REJECTED</option>
            <option value="BLOCK_PROPOSAL_SUBMITTED">PROPOSAL_SUBMITTED</option>
            <option value="OPTIMIZER_RUN">OPTIMIZER_RUN</option>
            <option value="SESSION_LOGIN">SESSION_LOGIN</option>
          </select>

          {!isMobile && (
            <button
              onClick={handleExportCSV}
              className="btn btn--secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Card Stack (Mobile) or Responsive Table (Tablet/Desktop) */}
      {isMobile ? (
        /* PHONE MODE: Card Stack */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredEntries.map((entry) => {
            const isExpanded = expandedRowId === entry.entryId;
            const timeStr = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Kolkata',
            });

            return (
              <div
                key={entry.entryId}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-panel)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {/* Row 1: Time + Role */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--color-text-mono)' }}>
                    {timeStr} IST
                  </span>
                  <span className="font-mono" style={{ color: 'var(--color-accent-operational)', fontWeight: 600 }}>
                    {entry.actorRole} ({entry.actorId})
                  </span>
                </div>

                {/* Row 2: Action + Target */}
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                  <strong>{entry.action}</strong>
                  <span style={{ color: 'var(--color-text-secondary)', marginLeft: 6 }}>
                    Target: <code className="font-mono" style={{ color: 'var(--color-text-mono)' }}>{entry.targetId}</code>
                  </span>
                </div>

                {/* Row 3: Hash + Expand Trigger */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--color-border-default)' }}>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                    SHA-256: {truncateHash(entry.integrityHash, 8)}
                  </span>
                  <button
                    onClick={() => toggleExpand(entry.entryId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-accent-operational)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                    <ChevronDown
                      size={12}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 150ms ease-out',
                      }}
                    />
                  </button>
                </div>

                {/* Expanded Delta Details */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: 8,
                      background: 'var(--color-bg-primary)',
                      borderRadius: 'var(--radius-data)',
                      border: '1px solid var(--color-border-default)',
                      fontSize: '10px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                      INTEGRITY HASH:
                    </div>
                    <div className="font-mono" style={{ wordBreak: 'break-all', color: 'var(--color-text-mono)' }}>
                      {entry.integrityHash}
                    </div>

                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 6, marginBottom: 2 }}>
                      PAYLOAD DELTA:
                    </div>
                    <pre
                      className="font-mono"
                      style={{
                        margin: 0,
                        padding: 6,
                        background: 'var(--color-bg-hover)',
                        borderRadius: 3,
                        overflowX: 'auto',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {JSON.stringify(entry.delta, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLET & DESKTOP: Multi-Column Table */
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Timestamp (IST)</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target</th>
                  {navMode === 'desktop' && <th>Delta Preview</th>}
                  <th>Hash (SHA-256)</th>
                  <th style={{ width: 60 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => {
                  const isExpanded = expandedRowId === entry.entryId;
                  const timeStr = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Kolkata',
                  });

                  return (
                    <Fragment key={entry.entryId}>
                      <tr
                        onClick={() => toggleExpand(entry.entryId)}
                        style={{ cursor: 'pointer', background: isExpanded ? 'var(--color-bg-hover)' : undefined }}
                      >
                        <td className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          {idx + 1}
                        </td>
                        <td className="font-mono" data-numeric="true">
                          {timeStr}
                        </td>
                        <td className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                          {entry.actorId}
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-accent-operational)' }}>
                            {entry.actorRole.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color:
                                entry.action === 'BLOCK_APPROVED'
                                  ? 'var(--color-accent-success)'
                                  : entry.action === 'BLOCK_REJECTED'
                                    ? 'var(--color-accent-critical)'
                                    : 'var(--color-text-primary)',
                            }}
                          >
                            {entry.action}
                          </span>
                        </td>
                        <td className="font-mono" style={{ color: 'var(--color-text-mono)' }}>
                          {entry.targetId}
                        </td>
                        {navMode === 'desktop' && (
                          <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                              {JSON.stringify(entry.delta).slice(0, 45)}...
                            </span>
                          </td>
                        )}
                        <td>
                          <code
                            className="font-mono"
                            style={{
                              fontSize: '11px',
                              background: 'var(--color-bg-hover)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-data)',
                            }}
                            title={entry.integrityHash}
                          >
                            {truncateHash(entry.integrityHash, 8)}
                          </code>
                        </td>
                        <td>
                          <button
                            className="btn btn--ghost"
                            style={{ padding: 4 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(entry.entryId);
                            }}
                          >
                            <ChevronDown
                              size={14}
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 150ms ease-out',
                              }}
                            />
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={navMode === 'desktop' ? 9 : 8} style={{ padding: 0 }}>
                            <div
                              style={{
                                padding: 'var(--spacing-3) var(--spacing-4)',
                                background: 'var(--color-bg-primary)',
                                borderTop: '1px solid var(--color-border-default)',
                                borderBottom: '1px solid var(--color-border-default)',
                                fontSize: 'var(--text-xs)',
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                                <div>
                                  <strong style={{ color: 'var(--color-text-secondary)' }}>Entry Hash: </strong>
                                  <code className="font-mono" style={{ color: 'var(--color-accent-operational)' }}>
                                    {entry.integrityHash}
                                  </code>
                                </div>
                                <div>
                                  <strong style={{ color: 'var(--color-text-secondary)' }}>Session ID: </strong>
                                  <code className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                                    {entry.sessionId}
                                  </code>
                                </div>
                              </div>

                              <div>
                                <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                                  State Delta (Full Payload):
                                </strong>
                                <pre
                                  className="font-mono"
                                  style={{
                                    margin: 0,
                                    padding: 'var(--spacing-2)',
                                    background: 'var(--color-bg-hover)',
                                    borderRadius: 'var(--radius-data)',
                                    overflowX: 'auto',
                                    fontSize: '11px',
                                  }}
                                >
                                  {JSON.stringify(entry.delta, null, 2)}
                                </pre>
                              </div>
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
      )}
    </div>
  );
}
