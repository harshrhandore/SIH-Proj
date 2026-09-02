// =============================================================================
// RailSync-AI / Gati-Shakti Unified Block Engine — Domain Types
// =============================================================================
// All core TypeScript interfaces for the railway operations domain.
// These types are the single source of truth for all mock data, API responses,
// Zustand stores, and component props throughout the application.
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive & Utility Types
// ---------------------------------------------------------------------------

/** ISO 8601 date-time string (e.g. "2024-03-15T14:30:00+05:30") */
export type ISO8601 = string;

/** Unique user identifier */
export type UserId = string;

/** Role code for RBAC enforcement */
export type RoleCode = 'ROLE_SC' | 'ROLE_ENG' | 'ROLE_TPC' | 'ROLE_ST';

/** Human-readable role names */
export const ROLE_LABELS: Record<RoleCode, string> = {
  ROLE_SC: 'Section Controller',
  ROLE_ENG: 'Engineering Dispatcher (P-Way/Civil)',
  ROLE_TPC: 'Traction Power Controller (OHE)',
  ROLE_ST: 'Signal & Telecom Controller',
};

/** Department codes */
export type Department = 'CIVIL' | 'ELECTRICAL' | 'SNT' | 'OPERATING';

/** Department human-readable labels */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  CIVIL: 'Civil / P-Way',
  ELECTRICAL: 'Electrical / OHE',
  SNT: 'Signal & Telecom',
  OPERATING: 'Operating / Traffic',
};

// ---------------------------------------------------------------------------
// Track & Geography
// ---------------------------------------------------------------------------

/** A position along the rail corridor */
export interface TrackSegment {
  stationName: string;
  stationCode: string;
  kmMark: number; // km from origin (Ghaziabad = 0)
  latitude: number;
  longitude: number;
}

/** A section of rail between two km marks */
export interface RailSection {
  divisionCode: string; // e.g. "NR-GZB" (Northern Railway, Ghaziabad Division)
  fromKm: number;
  toKm: number;
  lineType: 'UP' | 'DOWN' | 'BOTH';
}

// ---------------------------------------------------------------------------
// Train Services
// ---------------------------------------------------------------------------

export type ServiceType =
  | 'PASSENGER_SUPERFAST'
  | 'PASSENGER_MAIL'
  | 'FREIGHT_RAKE'
  | 'EMPTY_COACHING_STOCK'
  | 'ENGINEERING_SPECIAL';

export type TrainPriority = 1 | 2 | 3;
// 1 = Rajdhani/Shatabdi (highest), 2 = Mail/Express, 3 = Freight/ECS

export interface TrainService {
  trainNumber: string;       // e.g. "12004" (Shatabdi)
  trainName: string;
  serviceType: ServiceType;
  scheduledDeparture: ISO8601;
  scheduledArrival: ISO8601;
  currentDelayMinutes: number;
  path: TrackSegment[];      // ordered list of station–km positions
  priority: TrainPriority;
}

// ---------------------------------------------------------------------------
// Block Proposals
// ---------------------------------------------------------------------------

export type BlockStatus =
  | 'PENDING'
  | 'AI_RECOMMENDED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type BlockType = 'SINGLE' | 'JOINT';

export interface BlockProposal {
  proposalId: string;                    // UUID
  submittedBy: UserId;
  department: Department;
  blockType: BlockType;
  section: RailSection;
  requestedStart: ISO8601;
  requestedDuration: number;             // minutes
  actualGrantedStart?: ISO8601;
  actualGrantedDuration?: number;
  status: BlockStatus;
  aiPriorityScore: number;              // 0.0 – 1.0 from mock XGBoost
  punctualityImpactMinutes: number;     // net impact on affected trains
  gsrCompliance: GSRComplianceCheck[];
  auditTrail: AuditEntry[];
  // Additional operational fields
  equipmentActivity: string;            // description of work
  affectedTrains: string[];             // train numbers affected
  submittedAt: ISO8601;
}

// ---------------------------------------------------------------------------
// G&SR Compliance
// ---------------------------------------------------------------------------

export type GSRComplianceStatus = 'PASS' | 'WARN' | 'FAIL';

export interface GSRComplianceCheck {
  ruleId: string;          // e.g. "G&SR Rule 8.05", "SWR Para 11.3"
  description: string;
  status: GSRComplianceStatus;
  notes: string;
}

// ---------------------------------------------------------------------------
// Audit Trail (Tamper-Evident Hash Chain)
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'BLOCK_SUBMITTED'
  | 'AI_RECOMMENDATION_GENERATED'
  | 'BLOCK_REVIEWED'
  | 'BLOCK_APPROVED'
  | 'BLOCK_REJECTED'
  | 'BLOCK_CANCELLED'
  | 'BLOCK_ACTIVATED'
  | 'BLOCK_COMPLETED'
  | 'BLOCK_MODIFIED'
  | 'SIMULATION_RUN'
  | 'SIMULATION_RESCHEDULED'
  | 'TSR_ISSUED'
  | 'TSR_CANCELLED'
  | 'CAUTION_ORDER_ISSUED'
  | 'OVERRIDE_REQUESTED'
  | 'EMERGENCY_CANCELLATION'
  | 'INPUT_SANITIZED'
  | 'SESSION_STARTED'
  | 'SESSION_EXPIRED'
  | 'CSRF_VALIDATION_FAILED';

export interface AuditEntry {
  entryId: string;
  timestamp: ISO8601;
  actorId: UserId;
  actorRole: RoleCode;
  action: AuditAction;
  targetId: string;                     // proposalId or memoId
  delta: Record<string, unknown>;       // before/after values
  integrityHash: string;                // SHA-256 chain hash
  ipAddress: string;                    // mock IP
  sessionId: string;
}

// ---------------------------------------------------------------------------
// AI Explainability (SHAP)
// ---------------------------------------------------------------------------

export interface ShapFeature {
  featureName: string;
  featureValue: string | number;
  shapValue: number;       // positive = pushed score up, negative = down
  humanLabel: string;      // plain English explanation
}

export interface ShapExplanation {
  topFeatures: ShapFeature[];
  baseScore: number;
  finalScore: number;
  narrativeSummary: string; // 2–3 sentence plain English explanation
}

// ---------------------------------------------------------------------------
// Optimization Results (Mock OR-Tools CP-SAT)
// ---------------------------------------------------------------------------

export interface ConflictRecord {
  conflictId: string;
  proposalIdA: string;
  proposalIdB: string;
  overlapKmStart: number;
  overlapKmEnd: number;
  overlapTimeStart: ISO8601;
  overlapTimeEnd: ISO8601;
  resolution: string;
}

export interface PunctualityImpact {
  trainNumber: string;
  trainName: string;
  scheduledTime: ISO8601;
  predictedTime: ISO8601;
  deltaMinutes: number;
  priority: TrainPriority;
}

export interface OptimizationResult {
  proposalId: string;
  recommendedStart: ISO8601;
  recommendedDuration: number;
  bundledWith: string[];               // other proposalIds bundled as joint block
  conflictsResolved: ConflictRecord[];
  punctualityImpact: PunctualityImpact[];
  solveTimeMs: number;                 // mock OR-Tools CP-SAT solve time
  explanation: ShapExplanation;
}

// ---------------------------------------------------------------------------
// Temporary Speed Restrictions (TSRs)
// ---------------------------------------------------------------------------

export interface TSR {
  tsrId: string;
  fromKm: number;
  toKm: number;
  speedLimitKmph: number;
  reason: string;
  validFrom: ISO8601;
  validUntil: ISO8601;
  issuedBy: UserId;
  denReference: string;              // DEN order reference number
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// User & Session
// ---------------------------------------------------------------------------

export interface UserProfile {
  userId: UserId;
  name: string;
  role: RoleCode;
  divisionCode: string;
  employeeId: string;
}

export interface SessionState {
  user: UserProfile | null;
  csrfToken: string;
  sessionId: string;
  sessionExpiry: ISO8601;
  isAuthenticated: boolean;
  isExpired: boolean;
}

// ---------------------------------------------------------------------------
// Operational State
// ---------------------------------------------------------------------------

export type OpsState = 'NORMAL' | 'CAUTION' | 'EMERGENCY';

export interface DivisionStatus {
  divisionName: string;
  corridorLength: number;     // km
  lineType: string;           // "Double Line Electrified"
  opsState: OpsState;
  healthIndex: number;        // 0-100
  activeTSRCount: number;
}
