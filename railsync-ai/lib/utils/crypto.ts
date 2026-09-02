// =============================================================================
// SHA-256 Cryptographic Hash Chain Utility
// =============================================================================
// Implements tamper-evident audit log hashing using the Web Crypto API
// (crypto.subtle.digest). Each audit entry's hash includes the previous
// entry's hash, forming a chain that can be verified end-to-end.
//
// This is the core of the audit integrity system — static mockup entries
// with hardcoded hashes will fail verification.
// =============================================================================

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 * Returns hex-encoded hash string.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Use Web Crypto API (available in browser and Node.js 20+)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Build the canonical string for an audit entry's hash computation.
 * The canonical form is: entryId|timestamp|actorId|action|targetId|previousHash
 *
 * This deterministic format ensures that any modification to any field
 * will produce a different hash, and the chain dependency on previousHash
 * ensures that tampering with any entry invalidates all subsequent entries.
 */
export function buildCanonicalString(
  entryId: string,
  timestamp: string,
  actorId: string,
  action: string,
  targetId: string,
  previousHash: string
): string {
  return `${entryId}|${timestamp}|${actorId}|${action}|${targetId}|${previousHash}`;
}

/**
 * Compute the integrity hash for an audit entry.
 * @param entryId - Unique entry identifier
 * @param timestamp - ISO 8601 timestamp
 * @param actorId - User who performed the action
 * @param action - The audit action type
 * @param targetId - The proposal or memo being acted upon
 * @param previousHash - Hash of the previous entry in the chain (empty string for first)
 * @returns SHA-256 hex hash
 */
export async function computeEntryHash(
  entryId: string,
  timestamp: string,
  actorId: string,
  action: string,
  targetId: string,
  previousHash: string
): Promise<string> {
  const canonical = buildCanonicalString(
    entryId,
    timestamp,
    actorId,
    action,
    targetId,
    previousHash
  );
  return sha256(canonical);
}

/**
 * Verify the integrity of an entire audit chain.
 * Re-computes hashes for all entries in sequence and compares against
 * the stored integrityHash values.
 *
 * @param entries - Ordered array of audit entries to verify
 * @returns Verification result with details of any failures
 */
export async function verifyChain(
  entries: Array<{
    entryId: string;
    timestamp: string;
    actorId: string;
    action: string;
    targetId: string;
    integrityHash: string;
  }>
): Promise<{
  isValid: boolean;
  verifiedCount: number;
  totalCount: number;
  failureIndex: number | null;
  failureDetails: string | null;
}> {
  if (entries.length === 0) {
    return {
      isValid: true,
      verifiedCount: 0,
      totalCount: 0,
      failureIndex: null,
      failureDetails: null,
    };
  }

  let previousHash = ''; // Genesis entry has no previous hash

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const computed = await computeEntryHash(
      entry.entryId,
      entry.timestamp,
      entry.actorId,
      entry.action,
      entry.targetId,
      previousHash
    );

    if (computed !== entry.integrityHash) {
      return {
        isValid: false,
        verifiedCount: i,
        totalCount: entries.length,
        failureIndex: i,
        failureDetails: `Entry ${i} (${entry.entryId}): expected ${entry.integrityHash.substring(0, 16)}..., computed ${computed.substring(0, 16)}...`,
      };
    }

    previousHash = entry.integrityHash;
  }

  return {
    isValid: true,
    verifiedCount: entries.length,
    totalCount: entries.length,
    failureIndex: null,
    failureDetails: null,
  };
}

/**
 * Generate a truncated hash display (first 8 characters) for UI rendering.
 */
export function truncateHash(hash: string, length: number = 8): string {
  return hash.substring(0, length);
}
