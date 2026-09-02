'use client';

// =============================================================================
// Workspace Page (/workspace) — Block Planning & Marey Diagram Workspace
// =============================================================================
// Split layout (65% Marey Diagram / 35% Detail & Control Panel)
// Tabs: 1. Proposals, 2. AI Analysis (SHAP), 3. Corridor GIS
// =============================================================================

import { useState } from 'react';
import { useOperationalStore } from '@/store/operationalStore';
import MareyDiagram from '@/components/workspace/MareyDiagram';
import ProposalList from '@/components/workspace/ProposalList';
import AIAnalysisPanel from '@/components/workspace/AIAnalysisPanel';
import CorridorGIS from '@/components/workspace/CorridorGIS';
import ApprovalDrawer from '@/components/shared/ApprovalDrawer';
import { List, Brain, Map } from 'lucide-react';

export default function WorkspacePage() {
  const trains = useOperationalStore((s) => s.trains);
  const proposals = useOperationalStore((s) => s.proposals);
  const tsrs = useOperationalStore((s) => s.tsrs);

  const [activeTab, setActiveTab] = useState<'proposals' | 'ai' | 'gis'>('proposals');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>('BP-2024-001');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerProposalId, setDrawerProposalId] = useState<string | null>(null);

  const selectedProposal = proposals.find((p) => p.proposalId === selectedProposalId) || null;

  const handleSelectProposal = (id: string) => {
    setSelectedProposalId(id);
    setActiveTab('ai'); // Switch to Tab 2 as specified in prompt
  };

  const handleOpenDrawer = (id: string) => {
    setDrawerProposalId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      {/* Page Header Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-2) var(--spacing-3)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Block Planning &amp; Corridor Workspace
          </h1>
          <span style={{ color: 'var(--color-border-strong)' }}>|</span>
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-mono)' }}>
            Ghaziabad – Kanpur Central (412 km)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          <span>
            Active Trains: <strong className="font-mono" style={{ color: '#E6EDF3' }}>{trains.length}</strong>
          </span>
          <span>
            Proposals: <strong className="font-mono" style={{ color: '#E6EDF3' }}>{proposals.length}</strong>
          </span>
        </div>
      </div>

      {/* 65% / 35% Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '65% calc(35% - var(--spacing-3))',
          gap: 'var(--spacing-3)',
          height: 'calc(100vh - 190px)',
        }}
      >
        {/* Left: Marey Diagram Canvas */}
        <div style={{ height: '100%' }}>
          <MareyDiagram
            trains={trains}
            proposals={proposals}
            selectedProposalId={selectedProposalId}
            onSelectProposal={handleOpenDrawer}
          />
        </div>

        {/* Right: Tabbed Detail & Control Panel */}
        <div
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tabs bar */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-primary)',
            }}
          >
            <button
              onClick={() => setActiveTab('proposals')}
              style={{
                flex: 1,
                padding: 'var(--spacing-3)',
                background: activeTab === 'proposals' ? 'var(--color-bg-elevated)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'proposals' ? '2px solid var(--color-accent-operational)' : '2px solid transparent',
                color: activeTab === 'proposals' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <List size={14} />
              Proposals ({proposals.length})
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              style={{
                flex: 1,
                padding: 'var(--spacing-3)',
                background: activeTab === 'ai' ? 'var(--color-bg-elevated)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'ai' ? '2px solid var(--color-accent-operational)' : '2px solid transparent',
                color: activeTab === 'ai' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Brain size={14} />
              AI Analysis
            </button>

            <button
              onClick={() => setActiveTab('gis')}
              style={{
                flex: 1,
                padding: 'var(--spacing-3)',
                background: activeTab === 'gis' ? 'var(--color-bg-elevated)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'gis' ? '2px solid var(--color-accent-operational)' : '2px solid transparent',
                color: activeTab === 'gis' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Map size={14} />
              Corridor GIS
            </button>
          </div>

          {/* Tab Content Body */}
          <div style={{ flex: 1, padding: 'var(--spacing-3)', overflowY: 'auto' }}>
            {activeTab === 'proposals' && (
              <ProposalList
                proposals={proposals}
                selectedProposalId={selectedProposalId}
                onSelectProposal={handleSelectProposal}
                onOpenDrawer={handleOpenDrawer}
              />
            )}

            {activeTab === 'ai' && (
              <AIAnalysisPanel
                proposal={selectedProposal}
                trains={trains}
              />
            )}

            {activeTab === 'gis' && (
              <CorridorGIS
                selectedProposal={selectedProposal}
                tsrs={tsrs}
              />
            )}
          </div>
        </div>
      </div>

      {/* Disconnection Memo Approval Drawer */}
      <ApprovalDrawer
        isOpen={isDrawerOpen}
        proposalId={drawerProposalId}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
