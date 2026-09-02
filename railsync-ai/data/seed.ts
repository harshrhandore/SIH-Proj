// =============================================================================
// RailSync-AI — Complete Seed Data
// =============================================================================
// Realistic seed data for the Ghaziabad–Kanpur Central corridor (412 km,
// double line electrified). Contains:
//   - 14 train services (4 Rajdhani/Shatabdi, 5 Mail/Express, 3 Freight, 2 ECS)
//   - 7 active BlockProposals across all 4 departments
//   - 3 active TSRs with km marks, speed limits, and reasons
//   - Complete AuditTrail (6+ entries) for the most recent approved block
//   - 4 user profiles for each role
// =============================================================================

import type {
  TrainService,
  BlockProposal,
  TSR,
  AuditEntry,
  TrackSegment,
  UserProfile,
  GSRComplianceCheck,
  DivisionStatus,
} from '@/types/railway';

// ---------------------------------------------------------------------------
// Station Reference Data (Ghaziabad–Kanpur Central corridor)
// ---------------------------------------------------------------------------

export const STATIONS: TrackSegment[] = [
  { stationName: 'Ghaziabad', stationCode: 'GZB', kmMark: 0, latitude: 28.6692, longitude: 77.4181 },
  { stationName: 'Aligarh Junction', stationCode: 'ALJN', kmMark: 126, latitude: 27.8974, longitude: 78.0884 },
  { stationName: 'Tundla Junction', stationCode: 'TDL', kmMark: 191, latitude: 27.2130, longitude: 78.2350 },
  { stationName: 'Firozabad', stationCode: 'FZD', kmMark: 210, latitude: 27.1510, longitude: 78.3951 },
  { stationName: 'Shikohabad', stationCode: 'SKB', kmMark: 240, latitude: 26.8457, longitude: 78.5689 },
  { stationName: 'Etawah', stationCode: 'ETW', kmMark: 287, latitude: 26.7757, longitude: 79.0450 },
  { stationName: 'Phaphund', stationCode: 'PHD', kmMark: 330, latitude: 26.6098, longitude: 79.5129 },
  { stationName: 'Kanpur Central', stationCode: 'CNB', kmMark: 412, latitude: 26.4496, longitude: 80.3500 },
];

// ---------------------------------------------------------------------------
// User Profiles (one per role for demo)
// ---------------------------------------------------------------------------

export const USERS: Record<string, UserProfile> = {
  'USR-SC-001': {
    userId: 'USR-SC-001',
    name: 'R.K. Sharma',
    role: 'ROLE_SC',
    divisionCode: 'NR-GZB',
    employeeId: 'SC-4521',
  },
  'USR-ENG-001': {
    userId: 'USR-ENG-001',
    name: 'A.K. Verma',
    role: 'ROLE_ENG',
    divisionCode: 'NR-GZB',
    employeeId: 'ENG-7834',
  },
  'USR-TPC-001': {
    userId: 'USR-TPC-001',
    name: 'S.P. Gupta',
    role: 'ROLE_TPC',
    divisionCode: 'NR-GZB',
    employeeId: 'TPC-2109',
  },
  'USR-ST-001': {
    userId: 'USR-ST-001',
    name: 'M.L. Pandey',
    role: 'ROLE_ST',
    divisionCode: 'NR-GZB',
    employeeId: 'ST-6543',
  },
};

// ---------------------------------------------------------------------------
// Today's date helper (for generating relative timestamps)
// ---------------------------------------------------------------------------

function todayIST(hours: number, minutes: number = 0): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setHours(hours, minutes, 0, 0);
  return ist.toISOString();
}

// ---------------------------------------------------------------------------
// 14 Train Services
// ---------------------------------------------------------------------------

export const TRAIN_SERVICES: TrainService[] = [
  // ── Priority 1: Rajdhani / Shatabdi (4 trains) ──
  {
    trainNumber: '12004',
    trainName: 'Lucknow Shatabdi Express',
    serviceType: 'PASSENGER_SUPERFAST',
    scheduledDeparture: todayIST(6, 10),
    scheduledArrival: todayIST(12, 35),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 1,
  },
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express',
    serviceType: 'PASSENGER_SUPERFAST',
    scheduledDeparture: todayIST(7, 45),
    scheduledArrival: todayIST(13, 20),
    currentDelayMinutes: 8,
    path: STATIONS,
    priority: 1,
  },
  {
    trainNumber: '12034',
    trainName: 'Kanpur Shatabdi Express',
    serviceType: 'PASSENGER_SUPERFAST',
    scheduledDeparture: todayIST(15, 30),
    scheduledArrival: todayIST(21, 15),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 1,
  },
  {
    trainNumber: '22436',
    trainName: 'Varanasi Vande Bharat Express',
    serviceType: 'PASSENGER_SUPERFAST',
    scheduledDeparture: todayIST(9, 0),
    scheduledArrival: todayIST(14, 50),
    currentDelayMinutes: 12,
    path: STATIONS,
    priority: 1,
  },

  // ── Priority 2: Mail/Express (5 trains) ──
  {
    trainNumber: '14854',
    trainName: 'Marudhar Express',
    serviceType: 'PASSENGER_MAIL',
    scheduledDeparture: todayIST(8, 15),
    scheduledArrival: todayIST(15, 40),
    currentDelayMinutes: 25,
    path: STATIONS,
    priority: 2,
  },
  {
    trainNumber: '12382',
    trainName: 'Poorva Express',
    serviceType: 'PASSENGER_MAIL',
    scheduledDeparture: todayIST(10, 30),
    scheduledArrival: todayIST(17, 55),
    currentDelayMinutes: 18,
    path: STATIONS,
    priority: 2,
  },
  {
    trainNumber: '15002',
    trainName: 'Lucknow Mail',
    serviceType: 'PASSENGER_MAIL',
    scheduledDeparture: todayIST(11, 45),
    scheduledArrival: todayIST(19, 10),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 2,
  },
  {
    trainNumber: '12176',
    trainName: 'Chambal Express',
    serviceType: 'PASSENGER_MAIL',
    scheduledDeparture: todayIST(13, 20),
    scheduledArrival: todayIST(20, 45),
    currentDelayMinutes: 5,
    path: STATIONS,
    priority: 2,
  },
  {
    trainNumber: '14258',
    trainName: 'Kashi Vishwanath Express',
    serviceType: 'PASSENGER_MAIL',
    scheduledDeparture: todayIST(16, 0),
    scheduledArrival: todayIST(23, 30),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 2,
  },

  // ── Priority 3: Freight (3 trains) ──
  {
    trainNumber: 'BCCW-1247',
    trainName: 'BCN Rake (Coal)',
    serviceType: 'FREIGHT_RAKE',
    scheduledDeparture: todayIST(4, 30),
    scheduledArrival: todayIST(16, 0),
    currentDelayMinutes: 45,
    path: STATIONS,
    priority: 3,
  },
  {
    trainNumber: 'BTPN-3892',
    trainName: 'BTPN Rake (POL)',
    serviceType: 'FREIGHT_RAKE',
    scheduledDeparture: todayIST(5, 15),
    scheduledArrival: todayIST(17, 45),
    currentDelayMinutes: 30,
    path: STATIONS,
    priority: 3,
  },
  {
    trainNumber: 'BOXN-5641',
    trainName: 'BOXN Rake (Iron Ore)',
    serviceType: 'FREIGHT_RAKE',
    scheduledDeparture: todayIST(18, 0),
    scheduledArrival: todayIST(6, 0),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 3,
  },

  // ── ECS (2 trains) ──
  {
    trainNumber: 'ECS-0401',
    trainName: 'Empty Coaching Stock (LJN)',
    serviceType: 'EMPTY_COACHING_STOCK',
    scheduledDeparture: todayIST(12, 0),
    scheduledArrival: todayIST(18, 30),
    currentDelayMinutes: 0,
    path: STATIONS,
    priority: 3,
  },
  {
    trainNumber: 'ECS-0402',
    trainName: 'Empty Coaching Stock (CNB)',
    serviceType: 'EMPTY_COACHING_STOCK',
    scheduledDeparture: todayIST(19, 30),
    scheduledArrival: todayIST(2, 0),
    currentDelayMinutes: 10,
    path: STATIONS,
    priority: 3,
  },
];

// ---------------------------------------------------------------------------
// G&SR Compliance Checks (reusable sets)
// ---------------------------------------------------------------------------

const GSR_CHECKS_STANDARD: GSRComplianceCheck[] = [
  {
    ruleId: 'G&SR Rule 8.05',
    description: 'Minimum 4-hour advance notice for non-emergency blocks',
    status: 'PASS',
    notes: 'Notice submitted 6h 15m before requested start.',
  },
  {
    ruleId: 'G&SR Rule 15.02',
    description: 'Block section must be clear of all traffic before work commences',
    status: 'PASS',
    notes: 'Section Controller will confirm block section clear before granting.',
  },
  {
    ruleId: 'SWR Para 11.3',
    description: 'Engineering staff must carry competency certificates',
    status: 'PASS',
    notes: 'Competency cert reference: CC-2024-ENG-4521',
  },
  {
    ruleId: 'G&SR Rule 8.10',
    description: 'Adjacent station masters must be notified before block working',
    status: 'PASS',
    notes: 'Auto-notification will be triggered on approval.',
  },
  {
    ruleId: 'SWR Para 8.7',
    description: 'Speed restriction board placement at approach (2km before)',
    status: 'WARN',
    notes: 'TSR boards to be confirmed placed by P-Way inspector before block start.',
  },
];

const GSR_CHECKS_FAIL_NOTICE: GSRComplianceCheck[] = [
  {
    ruleId: 'G&SR Rule 8.05',
    description: 'Minimum 4-hour advance notice for non-emergency blocks',
    status: 'FAIL',
    notes: 'Notice submitted only 2h 14m before requested start. Minimum 4h required.',
  },
  {
    ruleId: 'G&SR Rule 15.02',
    description: 'Block section must be clear of all traffic before work commences',
    status: 'PASS',
    notes: 'Section clear status to be confirmed.',
  },
  {
    ruleId: 'SWR Para 11.3',
    description: 'Engineering staff must carry competency certificates',
    status: 'PASS',
    notes: 'Cert reference: CC-2024-ENG-7834',
  },
];

// ---------------------------------------------------------------------------
// 7 Block Proposals
// ---------------------------------------------------------------------------

// Note: auditTrail arrays will be populated after the audit entries are generated

export const BLOCK_PROPOSALS: BlockProposal[] = [
  // ── Proposal 1: APPROVED joint block (CIVIL + OHE + S&T) — has full audit trail ──
  {
    proposalId: 'BP-2024-001',
    submittedBy: 'USR-ENG-001',
    department: 'CIVIL',
    blockType: 'JOINT',
    section: { divisionCode: 'NR-GZB', fromKm: 287, toKm: 309, lineType: 'BOTH' },
    requestedStart: todayIST(14, 30),
    requestedDuration: 90,
    actualGrantedStart: todayIST(14, 30),
    actualGrantedDuration: 90,
    status: 'APPROVED',
    aiPriorityScore: 0.82,
    punctualityImpactMinutes: 4,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [], // populated below
    equipmentActivity: 'Tamping machine deployment for track geometry restoration, BCM follow-up ballast cleaning km 287-309',
    affectedTrains: ['12004', '12302', '14854'],
    submittedAt: todayIST(7, 0),
  },

  // ── Proposal 2: PENDING review (ELECTRICAL / OHE isolation) ──
  {
    proposalId: 'BP-2024-002',
    submittedBy: 'USR-TPC-001',
    department: 'ELECTRICAL',
    blockType: 'JOINT',
    section: { divisionCode: 'NR-GZB', fromKm: 287, toKm: 309, lineType: 'UP' },
    requestedStart: todayIST(14, 30),
    requestedDuration: 90,
    status: 'PENDING',
    aiPriorityScore: 0.78,
    punctualityImpactMinutes: 4,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [],
    equipmentActivity: '25kV OHE isolation for mast foundation repair, Elementary Section: ETW-PHD-UP, Feeder: Etawah TSS F-2',
    affectedTrains: ['12004', '12302'],
    submittedAt: todayIST(7, 15),
  },

  // ── Proposal 3: AI_RECOMMENDED (S&T point machine maintenance) ──
  {
    proposalId: 'BP-2024-003',
    submittedBy: 'USR-ST-001',
    department: 'SNT',
    blockType: 'SINGLE',
    section: { divisionCode: 'NR-GZB', fromKm: 287, toKm: 295, lineType: 'DOWN' },
    requestedStart: todayIST(14, 30),
    requestedDuration: 60,
    status: 'AI_RECOMMENDED',
    aiPriorityScore: 0.75,
    punctualityImpactMinutes: 2,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [],
    equipmentActivity: 'Point machine No. 12A/B annual maintenance at Etawah Yard, Track Circuit ID: TC-ETW-12, Affected routes: ETW-PHD DN loop',
    affectedTrains: ['15002'],
    submittedAt: todayIST(7, 30),
  },

  // ── Proposal 4: UNDER_REVIEW (CIVIL track renewal) ──
  {
    proposalId: 'BP-2024-004',
    submittedBy: 'USR-ENG-001',
    department: 'CIVIL',
    blockType: 'SINGLE',
    section: { divisionCode: 'NR-GZB', fromKm: 126, toKm: 145, lineType: 'UP' },
    requestedStart: todayIST(16, 0),
    requestedDuration: 120,
    status: 'UNDER_REVIEW',
    aiPriorityScore: 0.65,
    punctualityImpactMinutes: 12,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [],
    equipmentActivity: 'Track renewal with 60kg 90 UTS rails, km 126-145 UP line. Pre-stressed concrete sleeper replacement.',
    affectedTrains: ['12034', '14258', 'ECS-0401'],
    submittedAt: todayIST(6, 45),
  },

  // ── Proposal 5: PENDING with G&SR FAIL (insufficient notice) ──
  {
    proposalId: 'BP-2024-005',
    submittedBy: 'USR-ENG-001',
    department: 'CIVIL',
    blockType: 'SINGLE',
    section: { divisionCode: 'NR-GZB', fromKm: 200, toKm: 215, lineType: 'DOWN' },
    requestedStart: todayIST(12, 30),
    requestedDuration: 45,
    status: 'PENDING',
    aiPriorityScore: 0.45,
    punctualityImpactMinutes: 8,
    gsrCompliance: GSR_CHECKS_FAIL_NOTICE,
    auditTrail: [],
    equipmentActivity: 'Emergency rail fracture repair at km 207. Ultrasonic flaw detection revealed Class B defect.',
    affectedTrains: ['12382', '12176'],
    submittedAt: todayIST(10, 16),
  },

  // ── Proposal 6: REJECTED (TPC isolation request) ──
  {
    proposalId: 'BP-2024-006',
    submittedBy: 'USR-TPC-001',
    department: 'ELECTRICAL',
    blockType: 'SINGLE',
    section: { divisionCode: 'NR-GZB', fromKm: 330, toKm: 345, lineType: 'BOTH' },
    requestedStart: todayIST(10, 0),
    requestedDuration: 180,
    status: 'REJECTED',
    aiPriorityScore: 0.32,
    punctualityImpactMinutes: 22,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [],
    equipmentActivity: '25kV OHE re-tensioning km 330-345, Phaphund section. Catenary wire replacement.',
    affectedTrains: ['22436', '14854', '12382', 'BTPN-3892'],
    submittedAt: todayIST(5, 30),
  },

  // ── Proposal 7: ACTIVE (S&T cable fault repair, currently in progress) ──
  {
    proposalId: 'BP-2024-007',
    submittedBy: 'USR-ST-001',
    department: 'SNT',
    blockType: 'SINGLE',
    section: { divisionCode: 'NR-GZB', fromKm: 170, toKm: 185, lineType: 'UP' },
    requestedStart: todayIST(9, 0),
    requestedDuration: 60,
    actualGrantedStart: todayIST(9, 0),
    actualGrantedDuration: 60,
    status: 'ACTIVE',
    aiPriorityScore: 0.88,
    punctualityImpactMinutes: 3,
    gsrCompliance: GSR_CHECKS_STANDARD,
    auditTrail: [],
    equipmentActivity: 'OFC cable fault localization and splice repair, km 170-185 UP. SIL-2 interlocking bypass activated for affected track circuits.',
    affectedTrains: ['14854'],
    submittedAt: todayIST(4, 0),
  },
];

// ---------------------------------------------------------------------------
// Audit Trail for Proposal BP-2024-001 (APPROVED joint block)
// 6 entries showing: submission → AI recommendation → review → approval
// Hashes will be computed at runtime via crypto.ts
// ---------------------------------------------------------------------------

export const SEED_AUDIT_ENTRIES: Omit<AuditEntry, 'integrityHash'>[] = [
  {
    entryId: 'AUD-001',
    timestamp: todayIST(7, 0),
    actorId: 'USR-ENG-001',
    actorRole: 'ROLE_ENG',
    action: 'BLOCK_SUBMITTED',
    targetId: 'BP-2024-001',
    delta: {
      status: { before: null, after: 'PENDING' },
      department: 'CIVIL',
      section: 'km 287–309 BOTH',
      duration: '90 min',
    },
    ipAddress: '10.42.1.105',
    sessionId: 'SES-20240315-001',
  },
  {
    entryId: 'AUD-002',
    timestamp: todayIST(7, 2),
    actorId: 'SYSTEM',
    actorRole: 'ROLE_SC',
    action: 'AI_RECOMMENDATION_GENERATED',
    targetId: 'BP-2024-001',
    delta: {
      aiPriorityScore: 0.82,
      recommendedWindow: '14:30–16:00 IST',
      bundledWith: ['BP-2024-002', 'BP-2024-003'],
      solveTimeMs: 342,
    },
    ipAddress: '10.42.1.1',
    sessionId: 'SES-SYSTEM',
  },
  {
    entryId: 'AUD-003',
    timestamp: todayIST(8, 30),
    actorId: 'USR-SC-001',
    actorRole: 'ROLE_SC',
    action: 'BLOCK_REVIEWED',
    targetId: 'BP-2024-001',
    delta: {
      status: { before: 'PENDING', after: 'UNDER_REVIEW' },
      reviewerComment: 'Reviewing joint block window with AI optimizer recommendation. Checking punctuality impact on Shatabdi 12004.',
    },
    ipAddress: '10.42.1.200',
    sessionId: 'SES-20240315-002',
  },
  {
    entryId: 'AUD-004',
    timestamp: todayIST(9, 15),
    actorId: 'USR-SC-001',
    actorRole: 'ROLE_SC',
    action: 'BLOCK_REVIEWED',
    targetId: 'BP-2024-001',
    delta: {
      gsrCheckCompleted: true,
      allChecksPass: true,
      punctualityImpactAccepted: '+4 min on #12004 (within tolerance)',
    },
    ipAddress: '10.42.1.200',
    sessionId: 'SES-20240315-002',
  },
  {
    entryId: 'AUD-005',
    timestamp: todayIST(9, 30),
    actorId: 'USR-SC-001',
    actorRole: 'ROLE_SC',
    action: 'BLOCK_APPROVED',
    targetId: 'BP-2024-001',
    delta: {
      status: { before: 'UNDER_REVIEW', after: 'APPROVED' },
      grantedWindow: '14:30–16:00 IST',
      grantedDuration: 90,
      digitalSignature: 'SC-4521',
      memoReference: 'MEMO-NR-GZB-2024-0315-001',
    },
    ipAddress: '10.42.1.200',
    sessionId: 'SES-20240315-002',
  },
  {
    entryId: 'AUD-006',
    timestamp: todayIST(9, 31),
    actorId: 'SYSTEM',
    actorRole: 'ROLE_SC',
    action: 'CAUTION_ORDER_ISSUED',
    targetId: 'BP-2024-001',
    delta: {
      cautionOrder: 'CO-2024-0315-ETW',
      applicableSection: 'km 280–315',
      speedRestriction: '30 km/h approach, 15 km/h through block section',
      notifiedStations: ['Etawah', 'Phaphund'],
    },
    ipAddress: '10.42.1.1',
    sessionId: 'SES-SYSTEM',
  },
];

// ---------------------------------------------------------------------------
// 3 Active TSRs
// ---------------------------------------------------------------------------

export const ACTIVE_TSRS: TSR[] = [
  {
    tsrId: 'TSR-2024-001',
    fromKm: 156,
    toKm: 162,
    speedLimitKmph: 30,
    reason: 'Waterlogged formation — subgrade failure after heavy rainfall. Soil stabilization in progress.',
    validFrom: todayIST(0, 0),
    validUntil: todayIST(23, 59),
    issuedBy: 'USR-ENG-001',
    denReference: 'DEN/NR-GZB/TSR/2024/0087',
    isActive: true,
  },
  {
    tsrId: 'TSR-2024-002',
    fromKm: 245,
    toKm: 250,
    speedLimitKmph: 45,
    reason: 'Level crossing gate mechanism failure at LC-247. Manual flagging in operation. Repair awaiting spare parts.',
    validFrom: todayIST(0, 0),
    validUntil: todayIST(23, 59),
    issuedBy: 'USR-SC-001',
    denReference: 'DEN/NR-GZB/TSR/2024/0092',
    isActive: true,
  },
  {
    tsrId: 'TSR-2024-003',
    fromKm: 375,
    toKm: 382,
    speedLimitKmph: 20,
    reason: 'Rail fracture detected by ultrasonic flaw detection car. Emergency weld repair completed, monitoring period active.',
    validFrom: todayIST(0, 0),
    validUntil: todayIST(23, 59),
    issuedBy: 'USR-ENG-001',
    denReference: 'DEN/NR-GZB/TSR/2024/0095',
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Division Status
// ---------------------------------------------------------------------------

export const DIVISION_STATUS: DivisionStatus = {
  divisionName: 'Ghaziabad – Kanpur Central',
  corridorLength: 412,
  lineType: 'Double Line Electrified',
  opsState: 'NORMAL',
  healthIndex: 87,
  activeTSRCount: 3,
};
