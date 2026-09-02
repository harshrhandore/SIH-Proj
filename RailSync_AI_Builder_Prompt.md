# RailSync-AI / Gati-Shakti Unified Block Engine
## Antigravity Builder Prompt + Prompt Engineering Audit + Self-Critique Protocol

*Principal Railway Systems Architect | Staff Prompt Engineer Output*
*Target System: Indian Railways Divisional Control Room Operations Software*

---

---

# SECTION 1: EXECUTABLE PROTOTYPE PROMPT FOR ANTIGRAVITY

---

```
SYSTEM IDENTITY
───────────────
You are Antigravity — an autonomous full-stack prototyping and code generation engine.
You are about to build a production-grade, interactive prototype of the
RailSync-AI / Gati-Shakti Unified Block Engine: an AI-Powered Automatic Block
Planning System for Indian Railways Divisional Control Rooms.

This is NOT a SaaS landing page. This is NOT a generic dashboard. This is
mission-critical, cyber-physical operational software used by Sr. DOM (Divisional
Operations Manager), Section Controllers, Sr. DEN (Divisional Engineer), Sr. DEE
(Divisional Electrical Engineer), and ASTEs (Assistant Signal & Telecom Engineers).
Every design decision must reflect that weight.

══════════════════════════════════════════════════════════════════════════════════
PHASE 0 — MANDATORY PRE-FLIGHT ARCHITECTURAL CRITIQUE
══════════════════════════════════════════════════════════════════════════════════

BEFORE writing a single line of code, you MUST output a structured 4-point
self-critique. Format it exactly as:

  [PRE-FLIGHT CRITIQUE]
  ─────────────────────
  1. INFORMATION OVERLOAD AUDIT
     Describe what the Home Screen will show above-the-fold. Confirm it contains
     exactly 3 operational anchors and 1 primary CTA. Flag any temptation to add
     extra metric cards, charts, or tables — then explicitly reject those additions
     and state why.

  2. SAFETY VERIFICATION GUARDRAIL CHECK
     List every user action that modifies railway state (block grant, override,
     emergency cancellation). Confirm each has: (a) a minimum 2-step confirmation
     (intent → verify signature), (b) an explicit G&SR rule citation displayed
     inline, and (c) a tamper-evident audit log entry.

  3. MOCK API RESILIENCE ASSESSMENT
     Describe how each mock endpoint handles: (a) a cold start / empty state,
     (b) a network timeout simulation (500ms+), and (c) a conflict response
     (two departments requesting overlapping blocks). Confirm the UI renders a
     meaningful operational error state — not a spinner that hangs forever.

  4. AESTHETIC GUARDRAIL VERIFICATION
     List the top 3 UI patterns you might default to (e.g., gradient hero card,
     pill badge status, glassmorphism panel). Explicitly state that each of these
     will NOT appear in the prototype. Describe what will appear instead for each.

Only after completing the [PRE-FLIGHT CRITIQUE] output may you proceed to code.

══════════════════════════════════════════════════════════════════════════════════
TECH STACK (STRICT — DO NOT DEVIATE WITHOUT ANNOTATION)
══════════════════════════════════════════════════════════════════════════════════

Frontend Framework  : Next.js 14+ with App Router (TypeScript, strict mode)
Styling             : Tailwind CSS (no arbitrary color values except design tokens
                      defined in tailwind.config.ts — ALL palette choices must be
                      documented inline as comments)
UI Component Layer  : Shadcn UI components (configured for the design system below)
                      + Lucide React icons (NO icon libraries beyond this)
Data Visualization  :
  - Time-Distance (Marey) Train Graph: HTML5 Canvas via custom React hook
    (useMareyDiagram). Use requestAnimationFrame for smooth real-time updates.
    Do NOT use a pre-built charting library for this — write the renderer.
  - Secondary charts (bar/sparkline for TSR counts, delay distributions):
    Recharts, configured with the design system palette.
Geospatial          : Leaflet.js with react-leaflet for rail corridor GIS views.
                      Load OpenStreetMap tiles. Display track geometry as a
                      GeoJSON FeatureCollection (sanitized — see security section).
State Management    : Zustand (for global operational state: active blocks, user
                      role, audit log queue, simulation state)
Mock Backend        : TypeScript module at /lib/mock-api/ simulating:
  - Django REST Framework endpoints (block memo CRUD, approval workflow)
  - FastAPI AI service endpoints (XGBoost priority predictor, OR-Tools CP-SAT
    scheduler, SHAP explainability response)
  Latency simulation: wrap ALL mock responses in a simulateLatency(min, max)
  utility (min: 80ms, max: 400ms for normal; 1200ms for the AI optimizer call).
Auth (Mock)         : JWT-like mock tokens stored in Zustand (NOT localStorage).
                      Token payload includes: { userId, role, divisionCode,
                      sessionExpiry, csrfToken }. Display role prominently in
                      the top-right of the global nav at all times.

══════════════════════════════════════════════════════════════════════════════════
DESIGN SYSTEM (MANDATORY — ALL COMPONENTS MUST CONFORM)
══════════════════════════════════════════════════════════════════════════════════

COLOR PALETTE (Define as Tailwind CSS custom tokens):

  Background primary  : #0D1117  (near-black, not pure black — operational dark mode)
  Background elevated : #161B22  (panel/card surfaces)
  Background hover    : #1C232E  (interactive surface hover)
  Border default      : #30363D  (subtle dividers)
  Border strong       : #484F58  (section separators, focus rings)

  Text primary        : #E6EDF3  (main readable text)
  Text secondary      : #8B949E  (metadata, labels, timestamps)
  Text monospace      : #A5D6FF  (train numbers, km chainages, timestamps in data)
                        → Use font-variant-numeric: tabular-nums on ALL numeric
                          fields. This is non-negotiable for operational readability.

  Accent operational  : #1F6FEB  (primary interactive elements, active states)
  Accent warning      : #D29922  (TSRs, caution states, pending approvals)
  Accent critical     : #DA3633  (conflicts, emergencies, overdue blocks)
  Accent success      : #238636  (approved, cleared, normal state)
  Accent neutral      : #3D444D  (inactive, historical)

  PROHIBITED colors   : Any purple, violet, indigo, or magenta in the palette.
                        No gradients except as single-axis (top→bottom max 8%
                        opacity) on the status strip only.

TYPOGRAPHY:

  Interface font     : 'JetBrains Mono' (via Google Fonts) for ALL data fields,
                       train numbers, timestamps, km marks, and code-like values.
  Reading font       : 'Inter' (via Google Fonts) for labels, navigation,
                       descriptions, and AI explanation cards.
  Do NOT mix more than these two typefaces anywhere in the prototype.

  Type scale (rem-based):
    xs:   0.75rem / 1rem line-height    → metadata, timestamps
    sm:   0.875rem / 1.25rem            → table cells, secondary labels
    base: 1rem / 1.5rem                 → body, panel descriptions
    lg:   1.125rem / 1.75rem            → section headings
    xl:   1.25rem / 1.75rem             → panel titles
    2xl:  1.5rem / 2rem                 → page-level headings
    NEVER use font sizes above 2xl except for the status strip section name.

LAYOUT PRINCIPLES:

  - Global layout: Fixed 56px top navigation bar + 240px left sidebar (collapsible
    to 64px icon rail). Content area fills remaining viewport.
  - Grid: 12-column grid (1440px max content width, 24px gutters).
  - Spacing: 4px base unit. Use 4/8/12/16/24/32/48px rhythm only.
  - Border-radius: 4px for data cells and tags; 6px for panels; 0px for
    full-width status strip. DO NOT use rounded-full on any non-icon element.
  - Shadows: One shadow token only: 0 1px 3px rgba(0,0,0,0.4). No colored
    shadows, no glow effects, no blur effects.
  - Tables: All operational tables MUST have fixed-width columns, monospace
    numerals, zebra striping using #161B22 / #0D1117 alternating rows, and
    sticky first column for train numbers.

ANIMATION POLICY:
  - Permitted: opacity transitions (150ms ease-out) for drawer open/close.
  - Permitted: Canvas Marey diagram smooth scroll (requestAnimationFrame).
  - Prohibited: Slide-up entrance animations on cards. Prohibited: Auto-playing
    looping animations. Prohibited: Hover scale transforms on cards or buttons.

══════════════════════════════════════════════════════════════════════════════════
RBAC — ROLE DEFINITIONS & PERMISSION MATRIX
══════════════════════════════════════════════════════════════════════════════════

Define 4 user roles. The demo must include a role-switcher in the nav (visually
distinct, labeled clearly). Switching roles MUST immediately update what actions
are visible and available throughout the entire application via Zustand.

ROLE 1 — SECTION CONTROLLER (Traffic/Operating)
  Code: ROLE_SC
  Permissions:
    ✓ View all block proposals across all departments
    ✓ Review punctuality impact analysis (AI-generated)
    ✓ Grant or Reject block memos (with mandatory comment)
    ✓ Issue caution orders and TSRs
    ✓ Trigger Disruption Simulation
    ✗ Cannot submit block requests (that is the engineering departments' role)
    ✗ Cannot modify approved block parameters after signing

ROLE 2 — ENGINEERING DISPATCHER (P-Way / Civil)
  Code: ROLE_ENG
  Permissions:
    ✓ Submit tamping, BCM (Ballast Cleaning Machine), or track renewal block
      requests with location (km mark, section), duration, and equipment count
    ✓ View own submitted proposals and their approval status
    ✓ Attach digital maintenance permit (mock PDF reference)
    ✗ Cannot view S&T or OHE request details (need-to-know isolation)
    ✗ Cannot approve any block

ROLE 3 — TRACTION POWER CONTROLLER (TPC / Electrical)
  Code: ROLE_TPC
  Permissions:
    ✓ Submit 25kV OHE isolation requests with elementary section designation,
      substation feeder identity, and required isolation duration
    ✓ View combined joint block windows that include OHE isolation
    ✓ Confirm physical isolation with mock PTWS (Permit-To-Work System) reference
    ✗ Cannot view Civil/P-Way operational details
    ✗ Cannot approve block memos

ROLE 4 — SIGNAL & TELECOM CONTROLLER (S&T)
  Code: ROLE_ST
  Permissions:
    ✓ Submit point machine maintenance, interlocking test, or cable fault block
      requests with station name, affected routes, and track circuit IDs
    ✓ View joint block windows relevant to S&T work
    ✓ Confirm restoration with mock SIL-2 interlocking clearance reference
    ✗ Cannot modify traffic or OHE block parameters

IMPORTANT: All role permissions MUST be enforced at the component level using a
usePermissions(action: PermissionAction) hook. Components that the active role
cannot access must render a subtle "Access restricted — Role: [ROLE_NAME]" state,
NOT a blank screen or a 404.

══════════════════════════════════════════════════════════════════════════════════
MOCK DATA LAYER — SPECIFICATION
══════════════════════════════════════════════════════════════════════════════════

All mock data MUST be typed with TypeScript interfaces. Define these types at
/types/railway.ts. All mock generators live at /lib/mock-api/.

CORE TYPES (define all of these, no exceptions):

  TrainService {
    trainNumber: string          // e.g. "12004" (Shatabdi)
    trainName: string
    serviceType: 'PASSENGER_SUPERFAST' | 'PASSENGER_MAIL' | 'FREIGHT_RAKE'
                 | 'EMPTY_COACHING_STOCK' | 'ENGINEERING_SPECIAL'
    scheduledDeparture: ISO8601
    scheduledArrival: ISO8601
    currentDelayMinutes: number
    path: TrackSegment[]         // ordered list of station–km positions
    priority: 1 | 2 | 3         // 1 = Rajdhani/Shatabdi, 2 = Mail/Express, 3 = Freight
  }

  BlockProposal {
    proposalId: string           // UUID
    submittedBy: UserId
    department: 'CIVIL' | 'ELECTRICAL' | 'SNT' | 'OPERATING'
    blockType: 'SINGLE' | 'JOINT'
    section: RailSection         // { divisionCode, fromKm, toKm, lineType }
    requestedStart: ISO8601
    requestedDuration: number    // minutes
    actualGrantedStart?: ISO8601
    actualGrantedDuration?: number
    status: 'PENDING' | 'AI_RECOMMENDED' | 'UNDER_REVIEW' | 'APPROVED'
             | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    aiPriorityScore: number      // 0.0 – 1.0 from mock XGBoost
    punctualityImpactMinutes: number  // net impact on affected trains
    gsrCompliance: GSRComplianceCheck[]
    auditTrail: AuditEntry[]
  }

  GSRComplianceCheck {
    ruleId: string               // e.g. "G&SR Rule 8.05", "SWR Para 11.3"
    description: string
    status: 'PASS' | 'WARN' | 'FAIL'
    notes: string
  }

  AuditEntry {
    entryId: string
    timestamp: ISO8601
    actorId: UserId
    actorRole: RoleCode
    action: AuditAction          // enum of all modifying actions
    targetId: string             // proposalId or memoId
    delta: Record<string, unknown>  // before/after values
    integrityHash: string        // SHA-256 of (entryId + timestamp + actorId
                                 //   + action + targetId + previousHash)
                                 // Chain previous hashes for tamper-evidence
    ipAddress: string            // mock IP
    sessionId: string
  }

  ShapExplanation {
    topFeatures: Array<{
      featureName: string
      featureValue: string | number
      shapValue: number          // positive = pushed score up, negative = down
      humanLabel: string         // plain English explanation
    }>
    baseScore: number
    finalScore: number
    narrativeSummary: string     // 2–3 sentence plain English explanation
  }

  OptimizationResult {
    proposalId: string
    recommendedStart: ISO8601
    recommendedDuration: number
    bundledWith: string[]        // other proposalIds bundled as joint block
    conflictsResolved: ConflictRecord[]
    punctualityImpact: PunctualityImpact[]
    solveTimeMs: number          // mock OR-Tools CP-SAT solve time
    explanation: ShapExplanation
  }

Generate realistic seed data:
  - 14 train services (mix: 4 Rajdhani/Shatabdi, 5 Mail/Express, 3 Freight, 2 ECS)
    on the Ghaziabad – Kanpur Central corridor (412 km, double line electrified)
  - 7 active BlockProposals in various statuses across all 4 departments
  - 3 active TSRs with km marks, speed limits, and reasons
  - Complete AuditTrail for the most recent approved block (minimum 6 entries
    showing the chain: submission → AI recommendation → review → approval)

══════════════════════════════════════════════════════════════════════════════════
PAGE 1 — OPERATIONAL HOME DASHBOARD (/dashboard)
══════════════════════════════════════════════════════════════════════════════════

LAYOUT STRUCTURE (above-the-fold, no scroll required on 1440×900):

  ┌────────────────────────────────────────────────────────────────────────────┐
  │ STATUS STRIP (full width, 44px tall, #1C232E bg, left border 3px accent)   │
  │ "Ghaziabad – Kanpur Central Division  |  412 km  |  Double Line Electrified│
  │  OPS STATE: NORMAL"  [NORMAL shown in #238636 monospace tag]               │
  │  Right side: Clock (IST, live), Logged in as: [Role Badge + Name]          │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐  ┌──────────────────┐
  │  ANCHOR 1: PENDING JOINT BLOCK PROPOSALS              │  │ ANCHOR 3:        │
  │  ┌──────────────────────────────────────────────┐    │  │ CORRIDOR HEALTH  │
  │  │  3 Pending  |  Highest urgency: 2h 14m left  │    │  │ INDEX            │
  │  │  [View Queue →]                              │    │  │                  │
  │  └──────────────────────────────────────────────┘    │  │ Health: 87/100   │
  │                                                       │  │ (Recharts bar)   │
  │  ANCHOR 2: NEXT APPROVED BLOCK WINDOW                │  │                  │
  │  ┌──────────────────────────────────────────────┐    │  │ Active TSRs: 3   │
  │  │  14:30 – 16:00 IST  |  km 287–309           │    │  │ [View TSR List →] │
  │  │  Ghaziabad Yard  |  CIVIL + OHE + S&T Joint  │    │  └──────────────────┘
  │  │  [Review Block Details →]                    │    │
  │  └──────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────────────────┐
  │ PRIMARY ACTION BAR (full width, 52px, #161B22 bg, border-top #30363D)      │
  │ [⚡ Launch AI Optimizer — Review Pending Joint Windows]  |  Inject Delay ▾ │
  │  (Left: primary button, accent blue)   (Right: simulation trigger dropdown) │
  └────────────────────────────────────────────────────────────────────────────┘

Below the fold (navigated to via the left sidebar or anchor CTAs):
  - Approval Queue: compact tabular list of all pending proposals with
    sortable columns: Dept | Section (km) | Duration | Urgency | Priority Score
    Each row has inline [Review] button. NO expand-in-place — clicking opens
    the Approval Drawer (Page 3).
  - Recent Activity Feed: last 10 AuditEntry records, rendered as a compact
    timeline with monospace timestamps and diff-like formatting.

ROLE-AWARE RENDERING:
  - ROLE_SC: sees all 3 anchors + action bar. Approval Queue is active.
  - ROLE_ENG / ROLE_TPC / ROLE_ST: sees a filtered Anchor 1 showing only
    THEIR department's proposals. Anchor 2 and 3 visible. Action bar shows
    "Submit New Block Request" as the primary CTA instead.

══════════════════════════════════════════════════════════════════════════════════
PAGE 2 — BLOCK PLANNING & MAREY CHART WORKSPACE (/workspace)
══════════════════════════════════════════════════════════════════════════════════

SPLIT LAYOUT (resizable, default 65% / 35%):

LEFT PANEL — INTERACTIVE MAREY (TIME-DISTANCE) DIAGRAM:

  Build a custom HTML5 Canvas renderer. The diagram MUST:

  - X-axis: Time (6:00 IST to 24:00 IST), with 30-min gridlines (fine) and
    2-hour labels (bold). Time progression left-to-right.
  - Y-axis: Distance (km 0 to 412), station names at major nodes
    (Ghaziabad, Aligarh Jn, Tundla Jn, Firozabad, Shikohabad, Etawah,
    Phaphund, Kanpur Central), with horizontal station lines in #30363D.
  - Train paths: Each TrainService drawn as a diagonal line.
    Line color by priority: P1=#1F6FEB (bold, 2px), P2=#8B949E (1.5px),
    P3=#3D444D (1px dashed), Engineering=#D29922 (1px dotted).
  - Train number labels on lines in JetBrains Mono 10px, at the path midpoint,
    rotated to align with path angle.
  - Conflict zones: Render as translucent red (#DA3633, 15% opacity) rectangles
    overlapping any time-km region where two paths would intersect a proposed
    block that hasn't been approved.
  - Approved block windows: Render as solid #238636 rectangles (20% opacity)
    spanning the relevant km range and time window. Label: "[JOINT] km 287–309".
  - Shadow Block Slots (AI-Recommended): Render as #1F6FEB dashed-border
    rectangles (no fill) representing the AI optimizer's suggested block
    window. Hovering shows a tooltip with: "AI Recommended | Priority: 0.82 |
    Impact: +4 min on #12004 | Bundled: CIVIL + OHE".
  - Interactions: Click on a Shadow Block → opens the Approval Drawer (Page 3)
    pre-filled with that proposal. Pan: click-drag horizontal scroll. Zoom:
    mousewheel changes time-axis scale (2h → 18h range).
  - Real-time updates: When disruption simulation is active, affected train
    paths animate (via interpolation over 300ms) to their new delayed positions.

RIGHT PANEL — PROPOSAL DETAIL & CONTROL:

  Tabbed interface (3 tabs):

  TAB 1 — "Proposals"
    Compact scrollable list of all BlockProposals. Each item:
      [DEPT TAG] [STATUS TAG] Train #XXXXX ← most affected
      km 287–309  |  CIVIL + OHE + S&T  |  90 min  |  Score: 0.82
    Clicking an item highlights the corresponding Shadow Block on the Marey
    diagram AND opens the proposal in Tab 2.

  TAB 2 — "AI Analysis" (active when a proposal is selected)
    Display the ShapExplanation for the selected proposal:
    - Narrative summary in a bordered card (#161B22 bg, Inter font, base size)
    - SHAP feature chart: horizontal bar chart (Recharts) where positive values
      (#238636) push score up, negative (#DA3633) push down. Bars labeled with
      humanLabel. This is the "Why this slot?" explanation.
    - Three answer cards below the chart, each in a minimal bordered box:
      "Why this slot?" — top 3 SHAP features, plain language
      "Why bundled?"  — cost/efficiency reason, specific (e.g., "Bundling saves
                         240 train-minutes of impact vs. separate blocks")
      "Punctuality impact" — table: Train | Scheduled | Predicted | Delta
        All numbers in JetBrains Mono, tabular-nums.

  TAB 3 — "Corridor GIS"
    Leaflet map of the Ghaziabad–Kanpur corridor. Show:
    - Rail track GeoJSON line in #1F6FEB
    - Stations as custom Leaflet markers (railway icon)
    - Active TSRs as orange (#D29922) pulsing circle overlays with click popup
      showing: Speed limit, Reason, Valid until (date/time), DEN reference
    - Proposed block km range as a highlighted segment (red dashes)
    All GeoJSON input is sanitized via a parseAndValidateGeoJSON(raw) utility
    that strips script injections and validates coordinate bounds for India.

══════════════════════════════════════════════════════════════════════════════════
PAGE 3 — DISCONNECTION MEMO & APPROVAL DRAWER (RIGHT-SIDE OVERLAY)
══════════════════════════════════════════════════════════════════════════════════

Implemented as a right-side drawer component (480px wide, full-height, z-index
above workspace, #161B22 bg, left border 2px #30363D). Opens from both
dashboard and workspace without page navigation.

DRAWER SECTIONS (top to bottom, scrollable interior):

HEADER:
  "Block Disconnection Memo — DRAFT / PENDING / APPROVED"
  Proposal ID (monospace, copyable) | Department | Submitted by | Timestamp

SECTION A — BLOCK PARAMETERS:
  From: [km mark input, validated 0–412]  To: [km mark input]
  Date: [date picker]   Window Start: [time HH:MM]   Duration: [number, minutes]
  Line: [UP / DOWN / BOTH selector]
  Department: [CIVIL / ELECTRICAL / S&T — read-only if submitted]
  Equipment/Activity: [free text, max 200 chars, sanitized]

SECTION B — G&SR COMPLIANCE CHECKLIST:
  Render each GSRComplianceCheck as a checklist row:
  [✓ PASS / ⚠ WARN / ✗ FAIL] Rule ID — Description
  PASS rows: #238636 text. WARN rows: #D29922 text with expandable note.
  FAIL rows: #DA3633 text with a "Cannot approve — rule violated" tooltip.
  If ANY check is FAIL: the "Approve" button is DISABLED and shows
  "Approval blocked: G&SR violation. Contact Sr. DOM." text beneath.

SECTION C — AI EXPLAINABILITY CARD:
  Compact ShapExplanation display (narrative summary + top 2 features).
  Title: "AI Optimizer Reasoning (SHAP)" in secondary text color.
  A "View Full Analysis" link opens Tab 2 of the workspace.

SECTION D — PUNCTUALITY IMPACT TABLE:
  Minimal table: columns Train # | Delay Delta | Priority
  All values in JetBrains Mono. Red delta values for delays > 5 min.

SECTION E — DIGITAL SIGNATURE & APPROVAL ACTIONS (ROLE-GATED):

  For ROLE_SC only, show:
  Step 1 — "Confirm Intent":
    Checkbox: "I have reviewed the G&SR compliance checklist and AI analysis."
    This checkbox must be checked before the next step renders.

  Step 2 (renders only after Step 1 confirmed):
    [Employee ID] input (mock, auto-filled from session)
    [PIN / OTP — 6-digit numeric] input
    CTA: [  ✓ Approve Block Memo  ]  [  ✗ Reject  ]
    Both buttons require PIN to be 6 digits (validated client-side).
    Rejection requires a mandatory comment (minimum 20 characters).
    On approval: POST to mock API → response generates new AuditEntry with
    integrityHash chained to previous entry → drawer shows
    "Memo Approved — Reference: [memoId]" confirmation with 3s auto-dismiss.

  For all other roles: "Awaiting Section Controller review." in secondary text.

SECTION F — AUDIT TRAIL MINI-LOG:
  Compact list of existing AuditEntries for this proposal.
  Format: [timestamp] [ROLE] [action] — [delta summary]
  Hash shown truncated (first 8 chars) in monospace: "Integrity: a3f2bc91..."
  A "Verify Chain" button runs mock hash chain verification and shows:
  "✓ Chain intact — 6/6 entries verified" or
  "✗ Integrity failure at entry 4 — ALERT" (never shown in seed data,
   but the logic must be present and testable by switching a flag).

══════════════════════════════════════════════════════════════════════════════════
PAGE 4 — DYNAMIC DISRUPTION SIMULATION TOOL (/simulate)
══════════════════════════════════════════════════════════════════════════════════

This page is accessible to ALL roles (read-only for non-SC roles — they can
see the results but cannot trigger the re-optimization).

LAYOUT:

CONTROL PANEL (top, full-width strip):
  [ Select Train ] dropdown (shows all 14 train services, grouped by priority)
  [ Delay: ▏────────────────▏ ] slider: 5 to 90 minutes, step 5
  [ Inject Delay ]  button (ROLE_SC only; others see "View Only" label)
  Status: "No simulation active" / "Simulating... / "Results ready (1.2s)"

SIMULATION CANVAS (full-width Marey diagram, same renderer as Page 2 but
full-width and zoomed to the affected section):
  - Before state: ghost train paths in #3D444D (faded)
  - After state: re-positioned paths in their role-coded colors
  - Visual diff arrows showing path shift
  - Affected block windows: if a block collides with the delayed train's new
    path, it flashes #DA3633 and a conflict alert renders below

RESULTS PANEL (below canvas, 2-column grid):

  LEFT — IMPACT SUMMARY TABLE:
    For each affected BlockProposal, show:
    [Proposal ID] | Original Window | New Recommended Window | Delta | Status
    Status: 'Rescheduled' (#D29922) / 'No Change' (#8B949E) / 'Conflict' (#DA3633)
    All times in JetBrains Mono.

  RIGHT — AI RESCHEDULING NARRATIVE:
    Plain-language summary from mock OR-Tools response:
    "Train #12004 (Shatabdi) delay of 30 min has cascaded to km 287–309 block.
     OR-Tools CP-SAT rescheduled CIVIL block from 14:30 to 15:15 IST (45-min
     shift). Joint OHE and S&T blocks follow. Net punctuality cost: +2 min on
     #12302. Recommended approval by 13:45 IST."
    Solve time shown: "Optimized in 340ms (mock CP-SAT)"

MOCK ENGINE BEHAVIOR:
  On [Inject Delay] click:
  1. Show loading state: "Running OR-Tools CP-SAT optimization..." (max 2 seconds)
  2. After simulateLatency(1200, 2000)ms: update Zustand state with
     OptimizationResult. This must visually update BOTH the simulation canvas
     AND the dashboard's Anchor 2 (Next Approved Block Window) in real time
     (Zustand subscription).
  3. If the delay value > 60 minutes: show a secondary conflict alert
     "⚠ High-impact delay: Manual Section Controller review required."
     This alert is non-dismissible until the user visits the Approval Drawer.

══════════════════════════════════════════════════════════════════════════════════
PAGE 5 — AUDIT & SECURITY LOG (/audit)
══════════════════════════════════════════════════════════════════════════════════

LAYOUT: Full-width table with filter controls above.

FILTERS (single row above table):
  [ Date range picker ]  [ Role filter — multi-select ]
  [ Action type filter ]  [ Proposal ID search ]
  [ ⬇ Export CSV ]  (exports visible rows, sanitized — no raw hashes)

TABLE COLUMNS (fixed width, monospace numerals, sortable):
  Timestamp (IST) | Entry # | Actor | Role | Action | Target | Delta Preview
                                                               | Hash (8-char)

  Expanded row (click to expand): full delta JSON, full hash, verify button.
  Verification logic: same mock SHA-256 chain check as in the drawer.

INTEGRITY BANNER (above table, always visible):
  "✓ 47 entries — Chain integrity verified as of [timestamp]"
  This runs automatically on page load using a mock verifyChain() function.
  If tamper detected (via debug flag): red banner with alert.

SECURITY ANNOTATIONS (sidebar, collapsed by default):
  - CERT-In Compliance Reference: "IR Cyber Security Policy 2023 Section 4.2"
  - Mock SIEM integration note: "Entries forwarded to mock SIEM endpoint
    (disabled — enable in .env.local SIEM_ENDPOINT)"
  - Session management: display active session duration, last action timestamp,
    auto-logout warning at 25 minutes of inactivity (countdown displayed).

══════════════════════════════════════════════════════════════════════════════════
SECURITY IMPLEMENTATION REQUIREMENTS
══════════════════════════════════════════════════════════════════════════════════

1. INPUT SANITIZATION:
   - All free-text inputs (proposal descriptions, rejection comments, equipment
     fields): sanitize via a sanitizeInput(raw: string): string utility that
     strips HTML tags, script injections, and SQL-like patterns. Log sanitization
     events to the audit trail with action: 'INPUT_SANITIZED'.
   - GeoJSON: parseAndValidateGeoJSON(raw) validates: coordinate bounds within
     India (lat 8–37, lon 68–97), no feature count > 500, no embedded scripts
     in properties.

2. CSRF PROTECTION (MOCK):
   - Every state-modifying mock API call must include a csrfToken from the
     Zustand session state in the request body.
   - Mock API handler verifies csrfToken matches session. If not: return
     { error: 'CSRF_VALIDATION_FAILED', code: 403 } and the UI shows
     "Security validation failed. Please refresh." in an error banner.

3. JWT SESSION HANDLING (MOCK):
   - Session state includes sessionExpiry. A useSessionMonitor() hook checks
     expiry every 30 seconds. At 5 minutes remaining: toast warning
     "Session expiring in 5 minutes. Save work before logout."
     At expiry: lock the UI (overlay with "Session expired — Re-authenticate")
     and prevent any further mock API calls.
   - Token payload is never written to localStorage or sessionStorage.
     Store in Zustand in-memory only.

4. AUDIT INTEGRITY:
   - Every AuditEntry hash is computed as SHA-256 of a canonical string
     including the previous entry's hash (chain). Implement this with the
     Web Crypto API (crypto.subtle.digest).
   - On the Audit Log page and in the drawer, the "Verify Chain" action must
     re-compute hashes for all entries in sequence and compare.

5. ROLE ENFORCEMENT:
   - usePermissions(action) hook returns boolean. It must be called at the
     component render level — never inside an event handler only.
   - UI elements for restricted actions render as disabled with an aria-label
     explaining the restriction: "Approve Block: requires Section Controller role."

══════════════════════════════════════════════════════════════════════════════════
EDGE CASES & ERROR STATES (ALL MUST BE IMPLEMENTED)
══════════════════════════════════════════════════════════════════════════════════

Define and render meaningful UI states for each:

  EC-01: Empty approval queue      → "No pending proposals. System nominal."
                                     (Not: a spinner or a blank panel)

  EC-02: AI optimizer timeout      → After 2s with no response, show:
                                     "Optimizer unavailable — manual review
                                     required. Contact ADRM Operations Cell."
                                     with a "Retry" button.

  EC-03: Block conflict detected   → Red bordered alert with specific text:
                                     "Conflict: Train #12004 path overlaps
                                     proposed block km 287–309 at 14:47–14:52.
                                     Block cannot be granted without delay."

  EC-04: G&SR rule FAIL            → Approval button disabled, specific rule
                                     cited: "G&SR Rule 8.05 violated: Minimum
                                     notice period (4h) not met."

  EC-05: Network timeout (mock)    → "Service temporarily unavailable.
                                     Last sync: [timestamp]. Operating on
                                     cached data." Yellow banner, non-blocking.

  EC-06: Integrity chain failure   → "⚠ Audit chain tampered at entry #4.
                                     Incident reported to CISO. Ref: [mockId]"
                                     Red banner, cannot be dismissed.

  EC-07: Session expiry            → Full-screen overlay, blurs content.
                                     "Session expired. All unsaved block
                                     memo data has been preserved locally
                                     (mock draft cache). Re-authenticate."

══════════════════════════════════════════════════════════════════════════════════
FILE STRUCTURE (GENERATE ALL OF THESE)
══════════════════════════════════════════════════════════════════════════════════

/app
  /dashboard/page.tsx
  /workspace/page.tsx
  /simulate/page.tsx
  /audit/page.tsx
  /layout.tsx           ← global nav, sidebar, session monitor
  /globals.css          ← design token CSS variables

/components
  /layout
    GlobalNav.tsx       ← role badge, IST clock, role switcher
    Sidebar.tsx         ← collapsible icon rail, active nav state
    StatusStrip.tsx     ← full-width operational status header
  /dashboard
    OperationalAnchors.tsx
    ApprovalQueue.tsx
    RecentActivity.tsx
    PrimaryActionBar.tsx
  /workspace
    MareyDiagram.tsx    ← HTML5 Canvas renderer + useMareyDiagram hook
    ProposalList.tsx
    AIAnalysisPanel.tsx
    CorridorGIS.tsx     ← Leaflet map component
  /shared
    ApprovalDrawer.tsx  ← shared across dashboard + workspace
    GSRChecklist.tsx
    ShapExplanationCard.tsx
    PunctualityTable.tsx
    DigitalSignatureForm.tsx
    AuditMiniLog.tsx
    RoleGate.tsx        ← wrapper using usePermissions hook
  /simulate
    SimulationControl.tsx
    SimulationCanvas.tsx
    SimulationResults.tsx

/lib
  /mock-api
    proposals.ts        ← CRUD for BlockProposals with latency simulation
    optimizer.ts        ← mock XGBoost + CP-SAT + SHAP endpoint
    audit.ts            ← AuditEntry creation + chain verification
    auth.ts             ← mock JWT session management
    index.ts            ← barrel export
  /utils
    sanitize.ts         ← input sanitization utilities
    geojson.ts          ← GeoJSON validation/sanitization
    crypto.ts           ← Web Crypto SHA-256 hash chaining
    simulateLatency.ts  ← latency simulation wrapper

/store
  sessionStore.ts       ← Zustand: user, role, csrfToken, sessionExpiry
  operationalStore.ts   ← Zustand: proposals, trains, TSRs, active block
  simulationStore.ts    ← Zustand: simulation state + optimization results
  auditStore.ts         ← Zustand: in-memory audit log queue

/types
  railway.ts            ← all TypeScript types/interfaces
  permissions.ts        ← PermissionAction enum + RBAC matrix type

/data
  seed.ts               ← complete seed dataset (14 trains, 7 proposals, etc.)
  geojson
    ghaziabad-kanpur.geojson  ← rail corridor line geometry

/hooks
  usePermissions.ts
  useMareyDiagram.ts
  useSessionMonitor.ts
  useSimulation.ts

══════════════════════════════════════════════════════════════════════════════════
FINAL QUALITY GATE — BEFORE CONSIDERING THE BUILD COMPLETE
══════════════════════════════════════════════════════════════════════════════════

Run through this checklist internally before finalizing output:

  □ Does the Home Dashboard show exactly 3 operational anchors and 1 CTA
    above the fold? (No extra metric cards)
  □ Does the Marey diagram render with real train paths from seed data?
  □ Can switching roles via the nav role-switcher demonstrably change available
    actions (test: switch from SC to ENG — Approve button must disappear)?
  □ Does the Approval Drawer's 2-step confirmation flow work end-to-end,
    generating a new audit entry with a chained hash?
  □ Does injecting a 30-minute delay on the Simulation page update the Marey
    diagram AND the Dashboard Anchor 2 within 2 seconds?
  □ Does the Audit Log page's "Verify Chain" correctly validate all entries?
  □ Are ALL input fields sanitized via the sanitize.ts utilities?
  □ Does the prototype contain zero purple/violet/indigo/gradient-hero elements?
  □ Are all numeric fields rendering in JetBrains Mono with tabular-nums?
  □ Are all 7 edge cases (EC-01 through EC-07) reachable via UI interactions
    or via a debug panel?

If any checkbox is unchecked, correct the implementation before outputting the
final build.
```

---

---

# SECTION 2: SENIOR PROMPT ENGINEER CRITICAL AUDIT

*Evaluating the Section 1 prompt across structural clarity, ambiguity elimination,
boundary constraints, token efficiency, and anti-cliché enforcement.*

---

## 2.1 STRUCTURAL CLARITY ASSESSMENT

**Score: 9.2 / 10**

The prompt is architected in discrete, labeled phases with clear visual
separators (`══════` blocks). This prevents Antigravity from "blending" phases
together — a common failure mode in long generative prompts where the model
conflates UI specification with data schema requirements. Each major section
opens with a declarative sentence that unambiguously states what Antigravity
must produce and in what form.

The **Phase 0 Pre-flight Critique** mechanism is the structural lynchpin of the
entire prompt. By forcing Antigravity to externalize its planned approach *before
code generation begins*, the prompt:

1. Creates a verifiable commitment surface. The critique output can be read by
   a human reviewer before any code runs.
2. Forces deliberate design planning rather than pattern-matching to the nearest
   training example ("build a dashboard → Tailwind SaaS template").
3. Creates an internal contradiction detector: if Antigravity's critique says
   "I will not use glassmorphism" and then the generated code has `backdrop-blur`,
   the failure is immediately visible.

**One gap**: The prompt does not specify what happens if Antigravity *fails* the
Pre-flight Critique check — i.e., if its own analysis reveals a fatal design
conflict. A production-grade prompt would include: *"If your Pre-flight Critique
reveals an irreconcilable constraint (e.g., a required feature cannot be
implemented without violating a security constraint), STOP and output a structured
[CONSTRAINT CONFLICT] notice before proceeding."* Future revision should add this.

---

## 2.2 AMBIGUITY ELIMINATION ASSESSMENT

**Score: 9.5 / 10**

This prompt is unusually specific in the following high-risk areas:

**Visual ambiguity**: The Marey diagram section specifies not just *that* a
Canvas renderer must be built, but exactly *how* (requestAnimationFrame, specific
per-priority line widths in pixels, exact color codes for conflict zones, interaction
behavior on click/scroll/zoom). This eliminates Antigravity's most common
shortcut: wrapping a library in a `<div>` and calling it a "custom visualization."

**Data ambiguity**: TypeScript interface definitions are included inline. This is
critical. Without typed interfaces, a generative AI will invent inconsistent
property names across components (e.g., `trainId` in one component,
`train_number` in another). Providing the full type at the prompt level imposes
schema discipline across all generated code.

**Permission ambiguity**: The RBAC matrix specifies both positive permissions
(`✓`) and explicit prohibitions (`✗`) for each role. The `usePermissions(action)`
hook contract is named and its behavior (render-level enforcement, not
event-handler-level) is specified. Without this level of specificity, role
enforcement in generated code typically ends up as a single `if (role === 'SC')`
in one component, easily bypassed.

**Remaining ambiguity**: The `delta: Record<string, unknown>` type in
`AuditEntry` is intentionally flexible but could lead to inconsistent delta
formats across actions. A tighter definition (union type per `AuditAction`) would
be ideal in a production system but would significantly increase prompt length.
This is a conscious trade-off.

---

## 2.3 ANTI-CLICHÉ DESIGN ENFORCEMENT ASSESSMENT

**Score: 9.7 / 10**

This prompt deploys a multi-layer enforcement mechanism to prevent generic SaaS
aesthetics:

**Layer 1 — The Prohibition List**: Explicitly naming banned patterns
("glassmorphism blur cards," "floating pill badges," "purple/indigo gradients")
is more effective than generic "don't be generic" instructions. The AI model
cannot conflate prohibition with permission when the banned item is named.

**Layer 2 — The PROHIBITED COLOR Section**: Declaring specific prohibited colors
in the palette definition is technically powerful. Since the AI model generates
Tailwind class names probabilistically, naming prohibited hues forces it away
from its high-frequency defaults (`violet`, `purple`, `indigo` appear far more
often in SaaS dashboard training data than `#30363D` or `#A5D6FF`).

**Layer 3 — Reference Aesthetic Anchors**: "Bloomberg Terminal, Linear, Grafana,
modern ATC displays" are highly specific, real-world references with consistent
visual signatures. These anchor the model's aesthetic generation to a coherent
direction rather than leaving it to infer from vague descriptors like "professional."

**Layer 4 — The Final Quality Gate**: The self-audit checklist at the end
includes "Does the prototype contain zero purple/violet/indigo/gradient-hero
elements?" as an explicit pass/fail criterion. This is a terminal validation hook.

**The one weak point**: The prompt cannot *prevent* Antigravity from generating
generic animations at the CSS level — it specifies an animation policy but cannot
guarantee a model won't add `transition-all` to every button. The policy should
specify: *"Search generated CSS for `transition-all` and replace with explicit,
scoped transitions only. This is a post-generation lint requirement."*

---

## 2.4 FUNCTIONAL PROTOTYPE vs. STATIC MOCKUP ENFORCEMENT

**Score: 9.4 / 10**

This is where many builder prompts fail. The Section 1 prompt enforces live
functionality through several mechanisms:

**State-driven cross-page reactivity**: "Does injecting a 30-minute delay on the
Simulation page update the Marey diagram AND the Dashboard Anchor 2 within 2
seconds?" — this cross-component state update (Simulation → Dashboard) is only
possible with real Zustand state management. It cannot be faked with static data.

**Hash chain verification**: The "Verify Chain" button requires actual `crypto.subtle.digest`
calls across all audit entries. A static mockup with hardcoded hash strings will
fail this check (the chain won't verify against the computed hashes of the seed
data entries).

**Edge case forcing**: The 7 defined edge cases (EC-01 through EC-07) each
require a distinct application state. EC-03 (conflict detection) requires the
mock API to return a structured conflict response; EC-04 requires G&SR check
evaluation logic; EC-07 requires session expiry logic running on a timer. Each
of these is impossible to fake with a static UI.

**Latency simulation**: Specifying `simulateLatency(min, max)` as a wrapper
utility prevents the instant-response anti-pattern where all mock APIs appear to
respond at exactly 0ms — a clear tell of a non-functional prototype.

---

## 2.5 TOKEN EFFICIENCY ASSESSMENT

**Score: 8.1 / 10**

This prompt is long. It is intentionally so — for a mission-critical system with
this many interacting constraints, under-specification is a larger risk than
over-specification. However, several efficiency observations:

- The TypeScript interface definitions are necessary and could not be shortened
  without introducing ambiguity.
- The File Structure section is extremely efficient: it communicates 35+ expected
  files in a compact tree format rather than describing each separately.
- The Layout Structure ASCII wireframes use the minimum visual representation
  needed to specify spatial relationships.
- **Reduction opportunity**: The Security Implementation section has some
  conceptual overlap with the RBAC section. In a revision, these could be merged
  into a unified "Security Architecture" section, saving approximately 8% of
  token budget without information loss.
- **The Pre-flight Critique format specification** (requiring specific numbered
  output format) is correctly included despite its token cost — the structured
  output format is what makes the critique *verifiable*.

---

## 2.6 OVERALL ASSESSMENT

| Dimension                     | Score |
|-------------------------------|-------|
| Structural clarity            | 9.2   |
| Ambiguity elimination         | 9.5   |
| Anti-cliché enforcement       | 9.7   |
| Functional prototype forcing  | 9.4   |
| Token efficiency              | 8.1   |
| **Overall**                   | **9.2** |

**Summary**: The prompt is production-grade for a high-stakes generation task.
It is the kind of prompt an engineering team would version-control and audit.
The primary risk is that a model with limited context handling might truncate the
later sections (Security, Edge Cases, File Structure) during generation. Mitigation:
split into Phase A (architecture + data layer) and Phase B (UI + interactions) if
operating near a context window limit.

---

---

# SECTION 3: ANTIGRAVITY SELF-CRITIQUE PROTOCOL — HOW THE PROMPT ENFORCES RIGOR

*Explaining the mechanisms by which Section 1 maintains safety, security, and
UI minimalism discipline throughout Antigravity's code generation cycle.*

---

## 3.1 THE PRE-FLIGHT CRITIQUE AS A GENERATION GOVERNOR

The Pre-flight Critique (Phase 0) is not performative — it is a **commitment
extraction mechanism**. Here's why it works:

When a generative model is asked to self-critique its *planned* approach before
executing it, the commitment becomes part of the model's context window. All
subsequent generation must remain *coherent with what the model just committed to*.
Breaking the commitment (e.g., generating a glassmorphism card after writing "I
will not use glassmorphism") creates an incoherence in the generation trajectory
that the model's own probability scoring penalizes.

This is not guaranteed — a sufficiently large generation gap between the critique
and the affected code can dilute the coherence pressure. This is why the prompt's
Quality Gate checklist at the end creates a **second commitment point**: the model
must re-evaluate its outputs against the same constraints at generation close.
Together, the pre- and post-commitments create a generation envelope.

---

## 3.2 HOW SAFETY IS ENFORCED: THE 2-STEP ACTION PATTERN

Every state-modifying action in the system (block approval, override, cancellation)
is defined with a mandatory 2-step confirmation in the Approval Drawer:

- **Step 1** (Intent): Checkbox acknowledgment that G&SR checklist and AI
  analysis have been reviewed.
- **Step 2** (Verification): 6-digit PIN entry, enabling the final action button.

This pattern is specified at the *specification level*, not just as a UI
description. Because the TypeScript mock API function `approveBlockMemo()` is
expected to receive the PIN and csrfToken, generating a single-click approval
button would create an integration mismatch — the mock API call would fail
validation. The safety mechanism is thus load-bearing for the application's
functional correctness, not just a UI decoration.

The G&SR compliance check disabling the approval button when any check is FAIL
is similarly load-bearing: the `usePermissions` hook and the `GSRComplianceCheck[]`
evaluation function must both be implemented for the button's disabled state to
derive from actual data rather than a hardcoded boolean.

---

## 3.3 HOW SECURITY MINIMALISM IS ENFORCED: DEPENDENCY ISOLATION

The prompt specifies security utilities in isolation (`/lib/utils/sanitize.ts`,
`/lib/utils/crypto.ts`, `/lib/utils/geojson.ts`) and then mandates their use
at specific call sites. This creates a verifiable paper trail: a human reviewer
can grep for raw string interpolation in form handlers and check whether
`sanitizeInput()` is called. If it isn't, the architecture is violated — and the
Quality Gate checklist ("Are ALL input fields sanitized via the sanitize.ts
utilities?") makes this a pre-submission check.

The CSRF token mechanism (stored in Zustand, verified in every state-modifying
mock API handler) prevents the most common prototype security shortcut: treating
mock APIs as passthrough functions with no validation logic. Because the mock
handler explicitly checks `csrfToken`, any component that omits it from the
request body will receive a `403 CSRF_VALIDATION_FAILED` response — making the
failure visible during development without requiring an external security audit.

---

## 3.4 HOW UI MINIMALISM IS MAINTAINED: PROGRESSIVE DISCLOSURE ARCHITECTURE

The prompt enforces minimalism structurally, not just stylistically. The dashboard
above-the-fold specification is a **maximum constraint**: exactly 3 anchors and
1 CTA. There is no "and also show..." clause. This means any additional metric
card a generative model might be tempted to add is architecturally prohibited —
there is no specified container for it to live in.

The progressive disclosure pattern (detailed analyses behind tabs and drawers,
not on the landing page) is specified by defining which elements *appear on which
page*. The SHAP explanation, punctuality impact table, GIS map, and audit log
are each given explicit homes in the workspace tabs and audit page. By the time
Antigravity reaches the dashboard page specification, the model knows those
elements have been assigned elsewhere — there is no design vacuum that would
tempt it to "add a bit more here."

The Animation Policy's `Prohibited` list works the same way: it names the
specific default behaviors (`slide-up entrance animations`, `hover scale
transforms`) rather than relying on a general "be restrained" instruction. A
specific prohibition is infinitely more enforceable than a vague aesthetic aspiration.

---

## 3.5 TAMPER-EVIDENCE AS A GENERATIVE FORCING FUNCTION

The most elegant enforcement mechanism in the prompt is the **hash chain integrity
requirement**. Because the audit log must produce entries that pass the
`verifyChain()` function — which recomputes SHA-256 hashes across the entry chain
— the implementation *cannot be faked*. Static mockup entries with hardcoded
hash strings will not match the recomputed hashes derived from the actual content
of those entries.

This forces Antigravity to implement real cryptographic hashing logic
(`crypto.subtle.digest` calls in `crypto.ts`), real chain construction in
`audit.ts`, and a real verification function that iterates the entry sequence.
A prototype that skips any of these pieces will fail the Quality Gate checkbox
"Does the Audit Log page's 'Verify Chain' correctly validate all entries?" with
an observable error — not a silent degradation.

This is the philosophy at the core of the entire prompt's enforcement strategy:
**make correctness verifiable by making the success state computable**. Every
critical requirement has a corresponding observable that can be checked — a
button state, a render condition, a hash comparison, or a cross-component state
update — rather than relying on aesthetic review alone.

---

*End of document.*
*RailSync-AI Builder Prompt v1.0 | Indian Railways Divisional Control Room*
*Prepared for Antigravity autonomous prototyping engine*
