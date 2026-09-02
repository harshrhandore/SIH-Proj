// =============================================================================
// Audit Store (Zustand)
// =============================================================================
// In-memory audit log queue with SHA-256 hash chain integrity.
// Manages audit entries, chain verification state, and tamper detection.
// =============================================================================

import { create } from 'zustand';
import type { AuditEntry, AuditAction, RoleCode } from '@/types/railway';
import { computeEntryHash, verifyChain } from '@/lib/utils/crypto';
import { SEED_AUDIT_ENTRIES } from '@/data/seed';

interface AuditStore {
  // State
  entries: AuditEntry[];
  isInitialized: boolean;
  chainVerified: boolean | null; // null = not yet verified
  verifiedCount: number;
  totalCount: number;
  verificationTimestamp: string | null;
  failureIndex: number | null;
  failureDetails: string | null;

  // Debug flag for testing tamper detection (EC-06)
  tamperDebugFlag: boolean;

  // Actions
  initializeFromSeed: () => Promise<void>;
  addEntry: (
    actorId: string,
    actorRole: RoleCode,
    action: AuditAction,
    targetId: string,
    delta: Record<string, unknown>,
    sessionId: string
  ) => Promise<AuditEntry>;
  verifyIntegrity: () => Promise<void>;
  getEntriesForTarget: (targetId: string) => AuditEntry[];
  getRecentEntries: (count: number) => AuditEntry[];
  setTamperDebugFlag: (enabled: boolean) => void;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  entries: [],
  isInitialized: false,
  chainVerified: null,
  verifiedCount: 0,
  totalCount: 0,
  verificationTimestamp: null,
  failureIndex: null,
  failureDetails: null,
  tamperDebugFlag: false,

  initializeFromSeed: async () => {
    if (get().isInitialized) return;
    set({ isInitialized: true });

    const entries: AuditEntry[] = [];
    let previousHash = '';

    for (const seedEntry of SEED_AUDIT_ENTRIES) {
      const hash = await computeEntryHash(
        seedEntry.entryId,
        seedEntry.timestamp,
        seedEntry.actorId,
        seedEntry.action,
        seedEntry.targetId,
        previousHash
      );

      entries.push({
        ...seedEntry,
        integrityHash: hash,
      });

      previousHash = hash;
    }

    set({ entries, isInitialized: true });
  },

  addEntry: async (actorId, actorRole, action, targetId, delta, sessionId) => {
    const state = get();
    const previousHash =
      state.entries.length > 0
        ? state.entries[state.entries.length - 1].integrityHash
        : '';

    const entryId = `AUD-${String(state.entries.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();

    const hash = await computeEntryHash(
      entryId,
      timestamp,
      actorId,
      action,
      targetId,
      previousHash
    );

    const newEntry: AuditEntry = {
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

    set((state) => ({
      entries: [...state.entries, newEntry],
      // Invalidate previous verification
      chainVerified: null,
      verificationTimestamp: null,
    }));

    return newEntry;
  },

  verifyIntegrity: async () => {
    const state = get();
    let entriesToVerify = [...state.entries];

    // If tamper debug flag is on, corrupt entry at index 3 for testing
    if (state.tamperDebugFlag && entriesToVerify.length > 3) {
      entriesToVerify = entriesToVerify.map((e, i) =>
        i === 3
          ? { ...e, integrityHash: 'TAMPERED_HASH_FOR_TESTING' }
          : e
      );
    }

    const result = await verifyChain(entriesToVerify);

    set({
      chainVerified: result.isValid,
      verifiedCount: result.verifiedCount,
      totalCount: result.totalCount,
      verificationTimestamp: new Date().toISOString(),
      failureIndex: result.failureIndex,
      failureDetails: result.failureDetails,
    });
  },

  getEntriesForTarget: (targetId) => {
    return get().entries.filter((e) => e.targetId === targetId);
  },

  getRecentEntries: (count) => {
    const entries = get().entries;
    return entries.slice(-count).reverse();
  },

  setTamperDebugFlag: (enabled) => {
    set({ tamperDebugFlag: enabled, chainVerified: null });
  },
}));
