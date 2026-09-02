// =============================================================================
// Mock Audit API
// =============================================================================
// AuditEntry creation with SHA-256 hash chaining and chain verification.
// This is a thin API layer that delegates to the audit store and crypto utils.
// =============================================================================

import type { AuditAction, AuditEntry, RoleCode } from '@/types/railway';
import { computeEntryHash, verifyChain } from '@/lib/utils/crypto';
import { withLatency } from '@/lib/utils/simulateLatency';

/**
 * Create a new audit entry with hash chaining.
 * The hash is computed from the entry's fields + the previous entry's hash.
 */
export async function createAuditEntry(
  entries: AuditEntry[],
  actorId: string,
  actorRole: RoleCode,
  action: AuditAction,
  targetId: string,
  delta: Record<string, unknown>,
  sessionId: string
): Promise<AuditEntry> {
  const previousHash =
    entries.length > 0 ? entries[entries.length - 1].integrityHash : '';

  const entryId = `AUD-${String(entries.length + 1).padStart(3, '0')}`;
  const timestamp = new Date().toISOString();

  const hash = await computeEntryHash(
    entryId,
    timestamp,
    actorId,
    action,
    targetId,
    previousHash
  );

  return {
    entryId,
    timestamp,
    actorId,
    actorRole,
    action,
    targetId,
    delta,
    integrityHash: hash,
    ipAddress: '10.42.1.' + Math.floor(Math.random() * 254 + 1),
    sessionId,
  };
}

/**
 * Verify the integrity of the entire audit chain.
 * Re-computes hashes for all entries and compares against stored values.
 */
export async function verifyAuditChain(
  entries: AuditEntry[]
): Promise<{
  isValid: boolean;
  verifiedCount: number;
  totalCount: number;
  failureIndex: number | null;
  failureDetails: string | null;
}> {
  return withLatency(await verifyChain(entries), 80, 400);
}

/**
 * Export audit entries as CSV (sanitized — no raw hashes).
 */
export function exportAuditCSV(entries: AuditEntry[]): string {
  const headers = [
    'Entry ID',
    'Timestamp (IST)',
    'Actor',
    'Role',
    'Action',
    'Target',
    'Delta Preview',
  ];

  const rows = entries.map((e) => [
    e.entryId,
    new Date(e.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    e.actorId,
    e.actorRole,
    e.action,
    e.targetId,
    JSON.stringify(e.delta).substring(0, 100),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
