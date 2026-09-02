// =============================================================================
// Mock Proposals API
// =============================================================================
// CRUD operations for BlockProposals with latency simulation,
// conflict detection, and G&SR compliance evaluation.
// =============================================================================

import type { BlockProposal, BlockStatus, GSRComplianceCheck } from '@/types/railway';
import { withLatency } from '@/lib/utils/simulateLatency';
import { validateCsrf } from './auth';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * Get all proposals (with latency simulation).
 */
export async function getProposals(
  proposals: BlockProposal[]
): Promise<ApiResponse<BlockProposal[]>> {
  return withLatency({ success: true, data: proposals }, 80, 400);
}

/**
 * Get a single proposal by ID.
 */
export async function getProposalById(
  proposals: BlockProposal[],
  proposalId: string
): Promise<ApiResponse<BlockProposal>> {
  const proposal = proposals.find((p) => p.proposalId === proposalId);
  if (!proposal) {
    return withLatency(
      { success: false, error: `Proposal ${proposalId} not found`, code: 404 },
      80,
      400
    );
  }
  return withLatency({ success: true, data: proposal }, 80, 400);
}

/**
 * Update proposal status (approve, reject, etc.).
 * Requires CSRF validation.
 */
export async function updateProposalStatus(
  proposalId: string,
  newStatus: BlockStatus,
  csrfToken: string,
  sessionCsrf: string,
  comment?: string
): Promise<ApiResponse<{ proposalId: string; status: BlockStatus }>> {
  // CSRF validation
  const csrfCheck = validateCsrf(csrfToken, sessionCsrf);
  if (!csrfCheck.valid) {
    return withLatency(
      { success: false, error: csrfCheck.error, code: 403 },
      80,
      400
    );
  }

  // Rejection requires comment >= 20 chars
  if (newStatus === 'REJECTED' && (!comment || comment.length < 20)) {
    return withLatency(
      {
        success: false,
        error: 'Rejection requires a comment of at least 20 characters',
        code: 400,
      },
      80,
      400
    );
  }

  return withLatency(
    { success: true, data: { proposalId, status: newStatus } },
    80,
    400
  );
}

/**
 * Detect conflicts between a proposal and existing proposals/train paths.
 * Returns conflicting proposals and affected trains.
 */
export function detectConflicts(
  proposal: BlockProposal,
  allProposals: BlockProposal[]
): {
  hasConflict: boolean;
  conflictingProposals: BlockProposal[];
  reason: string;
} {
  const activeProposals = allProposals.filter(
    (p) =>
      p.proposalId !== proposal.proposalId &&
      (p.status === 'APPROVED' || p.status === 'ACTIVE') &&
      p.section.fromKm <= proposal.section.toKm &&
      p.section.toKm >= proposal.section.fromKm
  );

  if (activeProposals.length > 0) {
    const conflicting = activeProposals[0];
    return {
      hasConflict: true,
      conflictingProposals: activeProposals,
      reason: `Conflict: Approved block km ${conflicting.section.fromKm}–${conflicting.section.toKm} overlaps proposed block km ${proposal.section.fromKm}–${proposal.section.toKm}. Block cannot be granted without rescheduling.`,
    };
  }

  return {
    hasConflict: false,
    conflictingProposals: [],
    reason: '',
  };
}

/**
 * Evaluate G&SR compliance for a proposal.
 * Returns whether all checks pass and the detailed results.
 */
export function evaluateGSRCompliance(
  checks: GSRComplianceCheck[]
): {
  allPass: boolean;
  hasFailure: boolean;
  hasWarning: boolean;
  failedRules: string[];
} {
  const hasFailure = checks.some((c) => c.status === 'FAIL');
  const hasWarning = checks.some((c) => c.status === 'WARN');
  const failedRules = checks
    .filter((c) => c.status === 'FAIL')
    .map((c) => `${c.ruleId}: ${c.description}`);

  return {
    allPass: !hasFailure,
    hasFailure,
    hasWarning,
    failedRules,
  };
}
