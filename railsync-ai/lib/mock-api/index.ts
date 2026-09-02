// =============================================================================
// Mock API — Barrel Export
// =============================================================================

export { mockLogin, validateCsrf, isSessionExpired, getUserByRole } from './auth';
export { getProposals, getProposalById, updateProposalStatus, detectConflicts, evaluateGSRCompliance } from './proposals';
export { runOptimizer, runDisruptionSimulation } from './optimizer';
export { createAuditEntry, verifyAuditChain, exportAuditCSV } from './audit';
