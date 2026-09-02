// =============================================================================
// RailSync-AI — RBAC Permission System
// =============================================================================
// Defines the PermissionAction enum and the complete RBAC matrix mapping
// each RoleCode to its allowed actions. Used by the usePermissions() hook
// for render-level enforcement across all components.
// =============================================================================

import { RoleCode } from './railway';

// ---------------------------------------------------------------------------
// Permission Actions — every action that can be gated by role
// ---------------------------------------------------------------------------

export enum PermissionAction {
  // Block proposal lifecycle
  SUBMIT_BLOCK_REQUEST = 'SUBMIT_BLOCK_REQUEST',
  VIEW_ALL_PROPOSALS = 'VIEW_ALL_PROPOSALS',
  VIEW_OWN_PROPOSALS = 'VIEW_OWN_PROPOSALS',
  REVIEW_PROPOSAL = 'REVIEW_PROPOSAL',
  APPROVE_BLOCK = 'APPROVE_BLOCK',
  REJECT_BLOCK = 'REJECT_BLOCK',
  MODIFY_APPROVED_BLOCK = 'MODIFY_APPROVED_BLOCK',

  // Operational actions
  ISSUE_CAUTION_ORDER = 'ISSUE_CAUTION_ORDER',
  ISSUE_TSR = 'ISSUE_TSR',
  TRIGGER_SIMULATION = 'TRIGGER_SIMULATION',
  VIEW_SIMULATION = 'VIEW_SIMULATION',

  // AI actions
  LAUNCH_AI_OPTIMIZER = 'LAUNCH_AI_OPTIMIZER',
  VIEW_AI_ANALYSIS = 'VIEW_AI_ANALYSIS',
  VIEW_PUNCTUALITY_IMPACT = 'VIEW_PUNCTUALITY_IMPACT',

  // Departmental isolation
  VIEW_CIVIL_DETAILS = 'VIEW_CIVIL_DETAILS',
  VIEW_ELECTRICAL_DETAILS = 'VIEW_ELECTRICAL_DETAILS',
  VIEW_SNT_DETAILS = 'VIEW_SNT_DETAILS',
  VIEW_OPERATING_DETAILS = 'VIEW_OPERATING_DETAILS',

  // Specialized confirmations
  CONFIRM_PTWS = 'CONFIRM_PTWS',           // Permit-To-Work System (TPC)
  CONFIRM_SIL2_CLEARANCE = 'CONFIRM_SIL2_CLEARANCE', // S&T interlocking clearance
  ATTACH_MAINTENANCE_PERMIT = 'ATTACH_MAINTENANCE_PERMIT', // Engineering

  // Audit
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  EXPORT_AUDIT_CSV = 'EXPORT_AUDIT_CSV',
  VERIFY_CHAIN = 'VERIFY_CHAIN',
}

// ---------------------------------------------------------------------------
// RBAC Permission Matrix
// ---------------------------------------------------------------------------
// true  = permitted
// false = explicitly denied
// undefined = not applicable (treated as denied)
// ---------------------------------------------------------------------------

export const PERMISSION_MATRIX: Record<RoleCode, Partial<Record<PermissionAction, boolean>>> = {
  // ── SECTION CONTROLLER (Traffic/Operating) ──────────────────────────────
  ROLE_SC: {
    [PermissionAction.VIEW_ALL_PROPOSALS]: true,
    [PermissionAction.VIEW_OWN_PROPOSALS]: true,
    [PermissionAction.REVIEW_PROPOSAL]: true,
    [PermissionAction.APPROVE_BLOCK]: true,
    [PermissionAction.REJECT_BLOCK]: true,
    [PermissionAction.ISSUE_CAUTION_ORDER]: true,
    [PermissionAction.ISSUE_TSR]: true,
    [PermissionAction.TRIGGER_SIMULATION]: true,
    [PermissionAction.VIEW_SIMULATION]: true,
    [PermissionAction.LAUNCH_AI_OPTIMIZER]: true,
    [PermissionAction.VIEW_AI_ANALYSIS]: true,
    [PermissionAction.VIEW_PUNCTUALITY_IMPACT]: true,
    [PermissionAction.VIEW_CIVIL_DETAILS]: true,
    [PermissionAction.VIEW_ELECTRICAL_DETAILS]: true,
    [PermissionAction.VIEW_SNT_DETAILS]: true,
    [PermissionAction.VIEW_OPERATING_DETAILS]: true,
    [PermissionAction.VIEW_AUDIT_LOG]: true,
    [PermissionAction.EXPORT_AUDIT_CSV]: true,
    [PermissionAction.VERIFY_CHAIN]: true,
    // Explicitly denied:
    [PermissionAction.SUBMIT_BLOCK_REQUEST]: false,
    [PermissionAction.MODIFY_APPROVED_BLOCK]: false,
  },

  // ── ENGINEERING DISPATCHER (P-Way / Civil) ──────────────────────────────
  ROLE_ENG: {
    [PermissionAction.SUBMIT_BLOCK_REQUEST]: true,
    [PermissionAction.VIEW_OWN_PROPOSALS]: true,
    [PermissionAction.VIEW_CIVIL_DETAILS]: true,
    [PermissionAction.ATTACH_MAINTENANCE_PERMIT]: true,
    [PermissionAction.VIEW_AI_ANALYSIS]: true,
    [PermissionAction.VIEW_SIMULATION]: true,
    [PermissionAction.VIEW_AUDIT_LOG]: true,
    [PermissionAction.VIEW_PUNCTUALITY_IMPACT]: true,
    [PermissionAction.VERIFY_CHAIN]: true,
    // Explicitly denied:
    [PermissionAction.VIEW_ALL_PROPOSALS]: false,
    [PermissionAction.APPROVE_BLOCK]: false,
    [PermissionAction.REJECT_BLOCK]: false,
    [PermissionAction.VIEW_SNT_DETAILS]: false,
    [PermissionAction.VIEW_ELECTRICAL_DETAILS]: false,
    [PermissionAction.TRIGGER_SIMULATION]: false,
    [PermissionAction.LAUNCH_AI_OPTIMIZER]: false,
  },

  // ── TRACTION POWER CONTROLLER (TPC / Electrical) ────────────────────────
  ROLE_TPC: {
    [PermissionAction.SUBMIT_BLOCK_REQUEST]: true,
    [PermissionAction.VIEW_OWN_PROPOSALS]: true,
    [PermissionAction.VIEW_ELECTRICAL_DETAILS]: true,
    [PermissionAction.CONFIRM_PTWS]: true,
    [PermissionAction.VIEW_AI_ANALYSIS]: true,
    [PermissionAction.VIEW_SIMULATION]: true,
    [PermissionAction.VIEW_AUDIT_LOG]: true,
    [PermissionAction.VIEW_PUNCTUALITY_IMPACT]: true,
    [PermissionAction.VERIFY_CHAIN]: true,
    // Explicitly denied:
    [PermissionAction.VIEW_ALL_PROPOSALS]: false,
    [PermissionAction.APPROVE_BLOCK]: false,
    [PermissionAction.REJECT_BLOCK]: false,
    [PermissionAction.VIEW_CIVIL_DETAILS]: false,
    [PermissionAction.VIEW_SNT_DETAILS]: false,
    [PermissionAction.TRIGGER_SIMULATION]: false,
    [PermissionAction.LAUNCH_AI_OPTIMIZER]: false,
  },

  // ── SIGNAL & TELECOM CONTROLLER (S&T) ──────────────────────────────────
  ROLE_ST: {
    [PermissionAction.SUBMIT_BLOCK_REQUEST]: true,
    [PermissionAction.VIEW_OWN_PROPOSALS]: true,
    [PermissionAction.VIEW_SNT_DETAILS]: true,
    [PermissionAction.CONFIRM_SIL2_CLEARANCE]: true,
    [PermissionAction.VIEW_AI_ANALYSIS]: true,
    [PermissionAction.VIEW_SIMULATION]: true,
    [PermissionAction.VIEW_AUDIT_LOG]: true,
    [PermissionAction.VIEW_PUNCTUALITY_IMPACT]: true,
    [PermissionAction.VERIFY_CHAIN]: true,
    // Explicitly denied:
    [PermissionAction.VIEW_ALL_PROPOSALS]: false,
    [PermissionAction.APPROVE_BLOCK]: false,
    [PermissionAction.REJECT_BLOCK]: false,
    [PermissionAction.VIEW_CIVIL_DETAILS]: false,
    [PermissionAction.VIEW_ELECTRICAL_DETAILS]: false,
    [PermissionAction.TRIGGER_SIMULATION]: false,
    [PermissionAction.LAUNCH_AI_OPTIMIZER]: false,
  },
};

// ---------------------------------------------------------------------------
// Permission descriptions for aria-labels on restricted elements
// ---------------------------------------------------------------------------

export const PERMISSION_DESCRIPTIONS: Record<PermissionAction, string> = {
  [PermissionAction.SUBMIT_BLOCK_REQUEST]: 'Submit block request: requires Engineering, TPC, or S&T role',
  [PermissionAction.VIEW_ALL_PROPOSALS]: 'View all proposals: requires Section Controller role',
  [PermissionAction.VIEW_OWN_PROPOSALS]: 'View own proposals',
  [PermissionAction.REVIEW_PROPOSAL]: 'Review proposal: requires Section Controller role',
  [PermissionAction.APPROVE_BLOCK]: 'Approve block: requires Section Controller role',
  [PermissionAction.REJECT_BLOCK]: 'Reject block: requires Section Controller role',
  [PermissionAction.MODIFY_APPROVED_BLOCK]: 'Modify approved block: action not permitted',
  [PermissionAction.ISSUE_CAUTION_ORDER]: 'Issue caution order: requires Section Controller role',
  [PermissionAction.ISSUE_TSR]: 'Issue TSR: requires Section Controller role',
  [PermissionAction.TRIGGER_SIMULATION]: 'Trigger simulation: requires Section Controller role',
  [PermissionAction.VIEW_SIMULATION]: 'View simulation results',
  [PermissionAction.LAUNCH_AI_OPTIMIZER]: 'Launch AI optimizer: requires Section Controller role',
  [PermissionAction.VIEW_AI_ANALYSIS]: 'View AI analysis',
  [PermissionAction.VIEW_PUNCTUALITY_IMPACT]: 'View punctuality impact analysis',
  [PermissionAction.VIEW_CIVIL_DETAILS]: 'View Civil/P-Way details: restricted by role',
  [PermissionAction.VIEW_ELECTRICAL_DETAILS]: 'View Electrical/OHE details: restricted by role',
  [PermissionAction.VIEW_SNT_DETAILS]: 'View S&T details: restricted by role',
  [PermissionAction.VIEW_OPERATING_DETAILS]: 'View Operating details: restricted by role',
  [PermissionAction.CONFIRM_PTWS]: 'Confirm PTWS: requires Traction Power Controller role',
  [PermissionAction.CONFIRM_SIL2_CLEARANCE]: 'Confirm SIL-2 clearance: requires S&T Controller role',
  [PermissionAction.ATTACH_MAINTENANCE_PERMIT]: 'Attach maintenance permit: requires Engineering role',
  [PermissionAction.VIEW_AUDIT_LOG]: 'View audit log',
  [PermissionAction.EXPORT_AUDIT_CSV]: 'Export audit CSV',
  [PermissionAction.VERIFY_CHAIN]: 'Verify audit chain integrity',
};

// ---------------------------------------------------------------------------
// Helper: get role's department filter
// ---------------------------------------------------------------------------

import { Department } from './railway';

export const ROLE_DEPARTMENT_MAP: Partial<Record<RoleCode, Department>> = {
  ROLE_ENG: 'CIVIL',
  ROLE_TPC: 'ELECTRICAL',
  ROLE_ST: 'SNT',
  // ROLE_SC sees all departments — no filter
};
