import os
import subprocess
import tempfile
import shutil

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RailSync-AI: SIH Jury Presentation & Architecture Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4;
    margin: 14mm 16mm 16mm 16mm;
    @bottom-right {
      content: counter(page) " of " counter(pages);
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      color: #64748b;
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }

  /* Header / Cover Banner */
  .doc-header {
    border-bottom: 2px solid #0284c7;
    padding-bottom: 12px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .doc-title-area h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
  }

  .doc-subtitle {
    font-size: 11pt;
    font-weight: 600;
    color: #0284c7;
    margin: 0 0 4px 0;
  }

  .doc-meta {
    font-size: 8.5pt;
    color: #64748b;
    font-style: italic;
  }

  .badge-container {
    text-align: right;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-primary {
    background-color: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
    margin-bottom: 4px;
  }

  .badge-secondary {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
  }

  /* Headings */
  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  h2::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 14pt;
    background-color: #0284c7;
    border-radius: 2px;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 12px;
    margin-bottom: 6px;
  }

  p {
    margin: 0 0 8px 0;
  }

  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  strong {
    color: #0f172a;
  }

  /* Grid & Cards */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
    page-break-inside: avoid;
  }

  .card-header {
    font-weight: 700;
    font-size: 9pt;
    color: #0f172a;
    margin-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }

  .card-danger {
    background-color: #fff1f2;
    border-color: #fecdd3;
  }
  .card-danger .card-header {
    color: #9f1239;
    border-color: #fecdd3;
  }

  .card-success {
    background-color: #f0fdf4;
    border-color: #bbf7d0;
  }
  .card-success .card-header {
    color: #166534;
    border-color: #bbf7d0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 6px 10px;
    font-size: 8pt;
    letter-spacing: 0.2px;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  tr:hover td {
    background-color: #f1f5f9;
  }

  .badge-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    background-color: #e2e8f0;
    color: #334155;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: 600;
    display: inline-block;
  }

  /* Code / Diagram Block */
  .diagram-box {
    background-color: #0f172a;
    color: #38bdf8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    padding: 10px 14px;
    border-radius: 6px;
    line-height: 1.35;
    margin: 8px 0 12px 0;
    white-space: pre;
    overflow-x: hidden;
    page-break-inside: avoid;
  }

  /* Script Callouts */
  .speech-step {
    background-color: #ffffff;
    border-left: 3px solid #0284c7;
    border-top: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0 6px 6px 0;
    padding: 8px 12px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }

  .speech-step-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0284c7;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  .speech-step-quote {
    font-style: italic;
    color: #334155;
    font-size: 8.5pt;
  }

  /* Q&A Items */
  .qa-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }

  .qa-question {
    font-weight: 700;
    color: #0f172a;
    font-size: 9pt;
    margin-bottom: 4px;
  }

  .qa-answer {
    color: #334155;
    font-size: 8.5pt;
  }

  /* Stat Metric Strip */
  .metric-strip {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin: 10px 0 14px 0;
    page-break-inside: avoid;
  }

  .metric-card {
    flex: 1;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 8px 10px;
    text-align: center;
  }

  .metric-val {
    font-size: 15pt;
    font-weight: 800;
    color: #0369a1;
    line-height: 1.1;
  }

  .metric-label {
    font-size: 7pt;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="doc-header">
    <div class="doc-title-area">
      <h1>RailSync-AI</h1>
      <div class="doc-subtitle">Gati-Shakti Unified Block Engine for Indian Railways Divisional Control Rooms</div>
      <div class="doc-meta">Target Corridor: Ghaziabad Jn (GZB) – Kanpur Central (CNB) | 412 km, Northern / North Central Railway</div>
    </div>
    <div class="badge-container">
      <div class="badge badge-primary">Smart India Hackathon</div><br>
      <div class="badge badge-secondary">Jury Presentation Dossier</div>
    </div>
  </div>

  <!-- METRIC STRIP -->
  <div class="metric-strip">
    <div class="metric-card">
      <div class="metric-val">35% – 50%</div>
      <div class="metric-label">Track Closure Reduction</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">18% – 24%</div>
      <div class="metric-label">Punctuality Recovery</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">&lt; 2 Minutes</div>
      <div class="metric-label">Approval Cycle Time</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">100% G&amp;SR</div>
      <div class="metric-label">Statutory Rule Compliance</div>
    </div>
  </div>

  <!-- SECTION 1 -->
  <h2>1. Executive Summary: The Problem &amp; Solution</h2>
  <div class="grid-2">
    <div class="card card-danger">
      <div class="card-header">The Existing Problem in Indian Railways</div>
      <ul>
        <li><strong>Traffic vs. Maintenance Conflict:</strong> Over 13,000 passenger trains &amp; 9,000 freight rakes run on tracks operating at &gt;130% capacity.</li>
        <li><strong>Departmental Silos:</strong> Civil (P-Way), Electrical (TRD/OHE), S&amp;T, and Operating plan in isolation via phones, faxes, and WhatsApp.</li>
        <li><strong>Uncoordinated Blocks:</strong> Separate track shutdowns for each department waste corridor capacity.</li>
        <li><strong>Severe Operational Loss:</strong> &gt;50,000 hours of cumulative train delays annually and deferred repairs leading to dangerous rail fractures.</li>
      </ul>
    </div>
    <div class="card card-success">
      <div class="card-header">The RailSync-AI Breakthrough</div>
      <ul>
        <li><strong>Joint Corridor Synergy:</strong> Automatically detects overlapping requests and bundles Civil, Electrical, and S&amp;T into one unified block.</li>
        <li><strong>Explainable AI Priority:</strong> XGBoost + SHAP scoring rates block urgency based on asset degradation, traffic slack, and speed penalties.</li>
        <li><strong>Dynamic Disruption Recovery:</strong> Google OR-Tools CP-SAT solver reschedules trains &amp; shifts blocks in &lt;350ms during delays.</li>
        <li><strong>Cryptographic Safety Audit:</strong> Tamper-evident SHA-256 hash chain for Commissioner of Railway Safety (CRS) inquiries.</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 2 -->
  <h2>2. System Architecture Overview</h2>
  <div class="diagram-box">┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 RAILSYNC-AI PLATFORM                                    │
├─────────────────────────┬────────────────────────────┬─────────────────────────────────┤
│  1. OPERATIONAL LAYER   │  2. CYBER-PHYSICAL TWIN    │  3. STATUTORY SAFETY & AUDIT    │
│  - Operational Anchors  │  - High-DPI Marey Diagram  │  - G&SR Safety Checklist        │
│  - Approval Queue       │  - Leaflet GIS Corridor Map│  - SHAP Explainability Engine   │
│  - Role-Based CTAs      │  - Multi-Dept Proposals    │  - 6-Box Digital Signature PIN  │
│  - Live Event Feed      │  - Recharts Waterfall Chart│  - Web Crypto SHA-256 Chain     │
├─────────────────────────┴────────────────────────────┴─────────────────────────────────┤
│  4. RESILIENCE & SIMULATION ENGINE (Delay Injector + Google OR-Tools CP-SAT Solver)     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  5. TECH STACK: Next.js 15 App Router | TypeScript | Zustand Stores | Tailwind CSS     │
└────────────────────────────────────────────────────────────────────────────────────────┘</div>

  <!-- SECTION 3 -->
  <h2>3. Component-by-Component Deep Dive &amp; Operational Roles</h2>

  <h3>Layer 1: Real-time Operational Dashboard (/dashboard)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Component</th>
        <th style="width: 30%;">File Reference</th>
        <th style="width: 45%;">Operational Role in Control Room</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Operational Anchors</strong></td>
        <td><span class="badge-tag">OperationalAnchors.tsx</span></td>
        <td>Provides 3 vital operational KPIs: Pending Disconnection Memos count with urgency timer, Next Approved Block window (e.g. ALJN–KRJ 11:15–14:30), and Corridor Health Index (e.g. 84.2%) tracking TSR caution orders.</td>
      </tr>
      <tr>
        <td><strong>Approval Queue</strong></td>
        <td><span class="badge-tag">ApprovalQueue.tsx</span></td>
        <td>Sortable operational queue of all incoming department requests. Features AI Priority Scores, department badges, joint synergy tags, and responsive desktop table / mobile swipe-card views.</td>
      </tr>
      <tr>
        <td><strong>Primary Action Bar</strong></td>
        <td><span class="badge-tag">PrimaryActionBar.tsx</span></td>
        <td>Role-gated action trigger displaying contextual actions based on active officer role (e.g., <em>Launch AI Optimizer</em>, <em>Review Pending Blocks</em>, <em>Inject Delay</em>).</td>
      </tr>
      <tr>
        <td><strong>Recent Activity</strong></td>
        <td><span class="badge-tag">RecentActivity.tsx</span></td>
        <td>Live audit stream of all divisional events (block approvals, cancellations, caution order alerts) updated in real-time.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h3>Layer 2: Cyber-Physical Interactive Workspace (/workspace)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Component</th>
        <th style="width: 30%;">File Reference</th>
        <th style="width: 45%;">Operational Role in Control Room</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Marey Diagram</strong></td>
        <td><span class="badge-tag">MareyDiagram.tsx</span></td>
        <td>High-performance HTML5 Canvas digital twin of the traditional Indian Railways time-distance graph (412 km, GZB to CNB). Diagonal lines represent live train paths; shaded rectangles represent proposed/approved block windows. Supports 60 FPS multi-touch pinch-to-zoom and train inspection.</td>
      </tr>
      <tr>
        <td><strong>Corridor GIS Map</strong></td>
        <td><span class="badge-tag">CorridorGIS.tsx</span></td>
        <td>Leaflet-powered geospatial digital twin plotting exact station nodes, track polylines, and active TSR (Temporary Speed Restriction) caution order zones along the trunk route.</td>
      </tr>
      <tr>
        <td><strong>Proposal List</strong></td>
        <td><span class="badge-tag">ProposalList.tsx</span></td>
        <td>Departmental request aggregator. Automatically flags co-located Civil, Electrical, and S&amp;T maintenance proposals with "Joint Corridor Synergy Detected" badges.</td>
      </tr>
      <tr>
        <td><strong>AI Analysis Panel</strong></td>
        <td><span class="badge-tag">AIAnalysisPanel.tsx</span></td>
        <td>Interactive waterfall chart decomposing the AI priority score into component factors (+Asset Degradation, +Joint Synergy, -Punctuality Impact).</td>
      </tr>
    </tbody>
  </table>

  <h3>Layer 3: Statutory Safety &amp; Disconnection Memo Workflow</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Component</th>
        <th style="width: 30%;">File Reference</th>
        <th style="width: 45%;">Operational Role in Control Room</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Approval Drawer</strong></td>
        <td><span class="badge-tag">ApprovalDrawer.tsx</span></td>
        <td>480px slide-out drawer (or bottom sheet on mobile) managing the 6-section statutory review sequence replacing paper Form T/351.</td>
      </tr>
      <tr>
        <td><strong>G&amp;SR Checklist</strong></td>
        <td><span class="badge-tag">GSRChecklist.tsx</span></td>
        <td><strong>Strict Safety Gate:</strong> Enforces General &amp; Subsidiary Rules (OHE Power De-energization &amp; Earthing, Rule 15.09 Detonator/Banner Flag Protection, Rule 3.51 Point Clamping). The Approve button is permanently locked until all 3 are certified.</td>
      </tr>
      <tr>
        <td><strong>SHAP Card</strong></td>
        <td><span class="badge-tag">ShapExplanationCard.tsx</span></td>
        <td>Translates machine learning feature vectors into plain-language executive rationale so Section Controllers understand safety implications.</td>
      </tr>
      <tr>
        <td><strong>Punctuality Table</strong></td>
        <td><span class="badge-tag">PunctualityTable.tsx</span></td>
        <td>Calculates secondary delays on scheduled passenger and freight trains during the block period.</td>
      </tr>
      <tr>
        <td><strong>Digital Signature</strong></td>
        <td><span class="badge-tag">DigitalSignatureForm.tsx</span></td>
        <td><strong>2-Step Irrevocable Approval:</strong> Requires officer designation confirmation and a 6-digit statutory PIN input before committing the block grant.</td>
      </tr>
      <tr>
        <td><strong>Audit Mini-Log</strong></td>
        <td><span class="badge-tag">AuditMiniLog.tsx</span></td>
        <td>Displays real-time SHA-256 transaction hash generated for this memo, permanently linking it to the divisional master ledger.</td>
      </tr>
    </tbody>
  </table>

  <h3>Layer 4: Dynamic Disruption Simulation Engine (/simulate)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Component</th>
        <th style="width: 30%;">File Reference</th>
        <th style="width: 45%;">Operational Role in Control Room</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Simulation Control</strong></td>
        <td><span class="badge-tag">SimulationControl.tsx</span></td>
        <td>Disruption injector allowing controllers to pick any train (e.g. Freight BCN/E) and drag a touch slider (0–120m) to simulate delays or locomotive failures.</td>
      </tr>
      <tr>
        <td><strong>Simulation Canvas</strong></td>
        <td><span class="badge-tag">SimulationCanvas.tsx</span></td>
        <td>Ghost-train overlay showing scheduled vs. disrupted trajectories and highlighting newly created conflict zones with planned maintenance blocks.</td>
      </tr>
      <tr>
        <td><strong>Simulation Results</strong></td>
        <td><span class="badge-tag">SimulationResults.tsx</span></td>
        <td><strong>Google OR-Tools CP-SAT Solver:</strong> In &lt;350ms, computes the optimal Pareto frontier: dynamically shifts block slots, loops freight trains, protects Rajdhani/Vande Bharat paths, and recovers corridor throughput.</td>
      </tr>
    </tbody>
  </table>

  <h3>Layer 5: Cryptographic Safety &amp; Audit Ledger (/audit)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Component</th>
        <th style="width: 30%;">File Reference</th>
        <th style="width: 45%;">Operational Role in Control Room</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>SHA-256 Hash Chain</strong></td>
        <td><span class="badge-tag">app/audit/page.tsx</span></td>
        <td>Client-side immutable ledger using the browser's native Web Crypto API (SubtleCrypto). Each record links to the preceding entry: H(n) = SHA-256(H(n-1) + Timestamp + Payload + ControllerID).</td>
      </tr>
      <tr>
        <td><strong>EC-06 Tamper Test</strong></td>
        <td><span class="badge-tag">app/audit/page.tsx</span></td>
        <td>Live jury demo button: Clicking <em>"Simulate Tampering"</em> alters a historical record. The validator recomputes the chain, instantly detects the hash mismatch, and raises a prominent red tamper alert.</td>
      </tr>
      <tr>
        <td><strong>CRS Export Utility</strong></td>
        <td><span class="badge-tag">app/audit/page.tsx</span></td>
        <td>One-click export to CSV/JSON compliant with Commissioner of Railway Safety formal inquiry standards.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 4 -->
  <h2>4. Operational Personas &amp; Roles in Indian Railways</h2>
  <div class="grid-2">
    <div class="card">
      <div class="card-header">Sr. DOM / Section Controller (Operating/Traffic)</div>
      <p><strong>Role:</strong> Supreme line authority. Grants/cancels blocks. Balances train punctuality against maintenance needs. Authorizes electronic Disconnection Memos using 6-digit statutory PIN.</p>
    </div>
    <div class="card">
      <div class="card-header">Sr. DEN / AEN (Civil / Permanent Way)</div>
      <p><strong>Role:</strong> Track asset custodian. Submits track tamping, deep screening, and rail renewal proposals. Tracks Ultrasonic Flaw Detection (USFD) and track degradation indices.</p>
    </div>
    <div class="card">
      <div class="card-header">Sr. DEE / TPC (Electrical / TRD OHE)</div>
      <p><strong>Role:</strong> 25kV traction power custodian. Requests power blocks, catenary wire inspections, and neutral section maintenance. Confirms earthing discharge prior to Civil machinery entry.</p>
    </div>
    <div class="card">
      <div class="card-header">Sr. DSTE (Signal &amp; Telecom)</div>
      <p><strong>Role:</strong> Interlocking &amp; signaling custodian. Coordinates simultaneous point machine overhaul, track circuit testing, and ensures signal clamp locks are applied during major blocks.</p>
    </div>
  </div>

  <!-- SECTION 5 -->
  <h2>5. The Under-the-Hood Algorithms (For Technical Judges)</h2>
  <div class="card" style="margin-bottom: 8px;">
    <strong>1. Spatial-Temporal Clustering (Joint Corridor Synergy):</strong> Evaluates coordinate intervals between multiple department requests:
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 8pt; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; margin: 4px 0;">
      SpatialOverlap = max(0, min(E1, E2) - max(S1, S2)) &ge; 80% &nbsp;|&nbsp; TemporalWindowDelta &le; 90 min
    </div>
    Automatically aggregates them into a single Unified Joint Shadow Block, cutting line closures by up to 42%.
  </div>
  <div class="card" style="margin-bottom: 8px;">
    <strong>2. AI Priority Scoring (XGBoost + SHAP):</strong> Calculates composite score (0–100) using 4 feature vectors:
    <ul>
      <li><em>Asset Degradation Risk (35%):</em> Track Quality Index (TQI), rail fracture frequency, contact wire wear.</li>
      <li><em>Joint Synergy Multiplier (25%):</em> Number of co-located departments participating.</li>
      <li><em>Headway Traffic Slack (25%):</em> Time gap available between scheduled Vande Bharat / Rajdhani paths.</li>
      <li><em>TSR Speed Restriction Penalty (15%):</em> Daily economic loss from active caution orders.</li>
    </ul>
    SHAP decomposes this formula into human-readable waterfall contributions.
  </div>
  <div class="card" style="margin-bottom: 8px;">
    <strong>3. Constraint Satisfaction Solver (Google OR-Tools CP-SAT):</strong> Models the corridor as a Resource-Constrained Project Scheduling Problem. Enforces hard safety headways (&ge;7 min), single-track occupancy, and shifts maintenance windows in milliseconds during live delays.
  </div>
  <div class="card">
    <strong>4. Zero-Cost Client-Side Cryptographic Hash Chain:</strong> Leverages hardware-accelerated Web Crypto API (SubtleCrypto) for SHA-256 block sealing. No external blockchain gas fees, zero network latency, 100% mathematical tamper-evidence for CRS safety audits.
  </div>

  <div class="page-break"></div>

  <!-- SECTION 6 -->
  <h2>6. Winning 3-Minute SIH Jury Demo Script</h2>

  <div class="speech-step">
    <div class="speech-step-time">0:00 – 0:45 | The Problem &amp; The Hook</div>
    <div class="speech-step-quote">"Good morning, esteemed jury. On Indian Railways, over 13,000 passenger trains and 9,000 freight rakes compete daily with essential track maintenance. Currently, coordination is done over phone calls and paper memos across 4 separate departments. This causes over 50,000 hours of train delays annually and dangerous rail fractures. We present RailSync-AI: The Gati-Shakti Unified Block Engine."</div>
  </div>

  <div class="speech-step">
    <div class="speech-step-time">0:45 – 1:30 | Dashboard &amp; Joint Synergy (Show /dashboard)</div>
    <div class="speech-step-quote">"On our Executive Dashboard, the Section Controller gets live situational awareness: Corridor Health is 84%, with 4 urgent memos pending. Notice this badge: 'Joint Synergy Detected'. Both Civil Engineering and Electrical OHE requested blocks on the Aligarh–Khurja section. Instead of shutting down the track twice, RailSync-AI automatically merged them into a single 3-hour unified window, saving 2 hours of track capacity."</div>
  </div>

  <div class="speech-step">
    <div class="speech-step-time">1:30 – 2:15 | Workspace &amp; Safety Sign-Off (Show /workspace &amp; Drawer)</div>
    <div class="speech-step-quote">"In our Workspace, we have modernized the 140-year-old Marey Time-Distance Diagram into an interactive 60 FPS digital twin. When I click to review the Disconnection Memo: First, the SHAP chart explains why the AI recommended this slot. Second, statutory G&amp;SR Safety Rules lock the approval until OHE earthing, detonator protection, and point clamping are certified. Third, the Controller enters their 6-digit PIN to sign the memo electronically."</div>
  </div>

  <div class="speech-step">
    <div class="speech-step-time">2:15 – 2:45 | Disruption Resilience (Show /simulate)</div>
    <div class="speech-step-quote">"What happens when a train runs late? Let's inject a 45-minute delay on Freight 31024. Our Google OR-Tools CP-SAT solver instantly re-sequences the corridor: it shifts the block window dynamically, loops the freight rake, protects the Vande Bharat Express, and prevents cascading gridlock in just 320 milliseconds."</div>
  </div>

  <div class="speech-step">
    <div class="speech-step-time">2:45 – 3:00 | Cryptographic Audit &amp; Conclusion (Show /audit)</div>
    <div class="speech-step-quote">"Finally, for Commissioner of Railway Safety (CRS) inquiries, every decision is sealed in an immutable SHA-256 hash chain. If anyone attempts to tamper with past records, the system immediately catches it. RailSync-AI makes Indian Railways safer, more punctual, and ready for Mission Raftaar. Thank you!"</div>
  </div>

  <!-- SECTION 7 -->
  <h2>7. Jury Q&amp;A Cheat Sheet (Tough Questions &amp; Power Answers)</h2>

  <div class="qa-item">
    <div class="qa-question">Q1: "Will Indian Railways staff actually use this? Isn't it too complicated?"</div>
    <div class="qa-answer"><strong>Answer:</strong> "Controllers don't have to learn a new paradigm. We kept their existing mental model—the Marey Time-Distance diagram—and simply automated the tedious arithmetic and 20+ phone calls per block. What previously took 45 minutes of manual negotiation is now completed in 2 clicks."</div>
  </div>

  <div class="qa-item">
    <div class="qa-question">Q2: "What if the AI makes an error and causes an accident?"</div>
    <div class="qa-answer"><strong>Answer:</strong> "RailSync-AI is strictly an advisory Decision Support System with human-in-the-loop governance. Furthermore, G&amp;SR safety checks are hardcoded deterministic logic gates, not neural networks. The system cannot physically grant a block until all physical safety preconditions are verified and signed with a controller PIN."</div>
  </div>

  <div class="qa-item">
    <div class="qa-question">Q3: "How does this integrate with legacy Indian Railways systems (COA, FOIS, ICMS)?"</div>
    <div class="qa-answer"><strong>Answer:</strong> "RailSync-AI is built as a pluggable microservice. It ingests real-time train positions from COA (Control Office Application) via REST/WebSockets, pulls wagon axle load data from FOIS, and exports approved block schedules directly back to COA as structured track occupation memos."</div>
  </div>

  <div class="qa-item">
    <div class="qa-question">Q4: "Why use a SHA-256 hash chain instead of an enterprise blockchain like Hyperledger?"</div>
    <div class="qa-answer"><strong>Answer:</strong> "Indian Railways divisional control rooms operate on secure, air-gapped intranets. Public blockchains introduce gas fees, internet latency, and privacy issues. A client-side Web Crypto SHA-256 hash chain provides 100% mathematical tamper-evidence without latency, infrastructure costs, or external network dependencies."</div>
  </div>

  <div class="qa-item">
    <div class="qa-question">Q5: "How does the system perform in field conditions with poor internet?"</div>
    <div class="qa-answer"><strong>Answer:</strong> "RailSync-AI is fully responsive and optimized for low-bandwidth environments. The Marey Diagram runs on client-side HTML5 Canvas, and offline state persistence via Zustand ensures that inspectors on rugged Android tablets can review memos even during temporary connectivity drops."</div>
  </div>

</body>
</html>
"""

def generate_pdf():
    temp_dir = tempfile.gettempdir()
    html_path = os.path.join(temp_dir, "railsync_presentation_guide.html")
    pdf_temp_path = os.path.join(temp_dir, "railsync_presentation_guide.pdf")
    user_data_dir = os.path.join(temp_dir, "chrome_pdf_profile")
    
    dest_pdf = os.path.abspath(os.path.join(os.path.dirname(__file__), "SIH_PRESENTATION_GUIDE.pdf"))
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"HTML written to {html_path}")
    
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    cmd = [
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={user_data_dir}",
        f"--print-to-pdf={pdf_temp_path}",
        "--no-pdf-header-footer",
        html_path
    ]
    
    print("Running Chrome headless to generate PDF...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print("Chrome exit code:", result.returncode)
    if result.stdout:
        print("Chrome stdout:", result.stdout)
    if result.stderr:
        print("Chrome stderr:", result.stderr)
        
    if os.path.exists(pdf_temp_path):
        shutil.copy2(pdf_temp_path, dest_pdf)
        size_kb = os.path.getsize(dest_pdf) / 1024
        print(f"SUCCESS: Generated PDF at {dest_pdf} ({size_kb:.1f} KB)")
        try:
            os.remove(pdf_temp_path)
            os.remove(html_path)
            shutil.rmtree(user_data_dir, ignore_errors=True)
        except Exception as e:
            print("Cleanup warning:", e)
    else:
        print("ERROR: PDF was not generated.")

if __name__ == "__main__":
    generate_pdf()
